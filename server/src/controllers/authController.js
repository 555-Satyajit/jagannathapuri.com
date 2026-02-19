const prisma = require('../lib/prisma');
const supabase = require('../lib/supabaseClient');
const bcrypt = require('bcryptjs');
const cartController = require('./cartController');

exports.getLogin = (req, res) => {
    // If already logged in, redirect to account
    if (req.session.customerId) {
        return res.redirect('/user-account');
    }
    req.app.render('pages/login', (err, html) => {
        if (err) {
            console.error('Error rendering login:', err);
            return res.status(500).send('Error rendering login page');
        }
        res.render('layouts/master', { body: html });
    });
};

exports.postLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        // First try Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (!error && data.user) {
            // Supabase Login Success
            const user = data.user;

            // Sync/Find customer
            let customer = await prisma.customer.findUnique({ where: { email } });

            if (!customer) {
                customer = await prisma.customer.create({
                    data: {
                        email: user.email,
                        fullName: user.user_metadata.full_name || 'User',
                        supabase_id: user.id,
                        status: 'Active'
                    }
                });
            } else {
                await prisma.customer.update({
                    where: { email },
                    data: { supabase_id: user.id, status: 'Active' }
                });
            }

            req.session.customerId = customer.id;
            req.session.customerName = customer.fullName;

            if (req.session.cart && req.session.cart.length > 0) {
                await cartController.mergeSessionCart(req.session.cart, customer.id);
                req.session.cart = [];
            }

            return res.json({ success: true, message: 'Login successful' });
        }

        // Fallback: Check Local Database for Password (for Google users who set a password)
        const customer = await prisma.customer.findUnique({ where: { email } });

        if (customer && customer.password) {
            const isMatch = await bcrypt.compare(password, customer.password);
            if (isMatch) {
                // Local Password Match
                req.session.customerId = customer.id;
                req.session.customerName = customer.fullName;

                if (req.session.cart && req.session.cart.length > 0) {
                    await cartController.mergeSessionCart(req.session.cart, customer.id);
                    req.session.cart = [];
                }

                return res.json({ success: true, message: 'Login successful' });
            }
        }

        // If both failed
        return res.status(401).json({ success: false, error: 'Invalid login credentials' });

    } catch (error) {
        console.error('Error in postLogin:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

exports.getRegister = (req, res) => {
    if (req.session.customerId) {
        return res.redirect('/user-account');
    }
    req.app.render('pages/register', (err, html) => {
        if (err) {
            console.error('Error rendering register:', err);
            return res.status(500).send('Error rendering register page');
        }
        res.render('layouts/master', { body: html });
    });
};

exports.postRegister = async (req, res) => {
    const { fullName, email, password, phone } = req.body;

    try {
        // Sign up with Supabase
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: process.env.SITE_URL || 'https://jagannathapuri.com/user-account',
                data: {
                    full_name: fullName,
                    phone: phone
                }
            }
        });

        if (error) {
            return res.status(400).json({ success: false, error: error.message });
        }

        const { user, session } = data;
        const requiresVerification = !session;

        // Sync with local Customer table
        let customer = await prisma.customer.findUnique({
            where: { email }
        });

        const customerData = {
            fullName,
            supabase_id: user.id,
            phone: phone || (customer ? customer.phone : null),
            status: requiresVerification ? 'Pending' : 'Active'
        };

        if (customer) {
            customer = await prisma.customer.update({
                where: { email },
                data: customerData
            });
        } else {
            customer = await prisma.customer.create({
                data: {
                    ...customerData,
                    email,
                }
            });
        }

        // Only set session if verified (session exists)
        if (!requiresVerification) {
            req.session.customerId = customer.id;
            req.session.customerName = customer.fullName;

            // Merge Cart
            if (req.session.cart && req.session.cart.length > 0) {
                await cartController.mergeSessionCart(req.session.cart, customer.id);
                req.session.cart = [];
            }

            return res.json({ success: true, message: 'Registration successful' });
        } else {
            return res.json({
                success: true,
                requiresVerification: true,
                message: 'Registration successful. Please check your email to verify your account.'
            });
        }
    } catch (error) {
        console.error('Error in postRegister:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

exports.postSendOTP = async (req, res) => {
    const { email } = req.body;

    try {
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                // Supabase will send the email automatically if configured
                emailRedirectTo: process.env.SITE_URL || 'https://jagannathapuri.com'
            }
        });

        if (error) {
            return res.status(400).json({ success: false, error: error.message });
        }

        res.json({ success: true, message: 'OTP sent successfully to your email' });
    } catch (error) {
        console.error('Error in postSendOTP:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

exports.postVerifyOTP = async (req, res) => {
    const { email, token } = req.body;

    try {
        const { data, error } = await supabase.auth.verifyOtp({
            email,
            token,
            type: 'magiclink' // or 'signup' / 'invite' depending on flow. magiclink is standard for login.
        });

        if (error) {
            return res.status(400).json({ success: false, error: error.message });
        }

        const user = data.user;

        // Sync with local DB
        let customer = await prisma.customer.findUnique({
            where: { email }
        });

        if (!customer) {
            customer = await prisma.customer.create({
                data: {
                    email: user.email,
                    fullName: user.email.split('@')[0],
                    supabase_id: user.id,
                    status: 'Active'
                }
            });
        } else {
            // Update supabase_id and ensure status is Active
            customer = await prisma.customer.update({
                where: { email },
                data: {
                    supabase_id: user.id,
                    status: 'Active'
                }
            });
        }

        // Set session
        req.session.customerId = customer.id;
        req.session.customerName = customer.fullName;

        // Merge Cart
        if (req.session.cart && req.session.cart.length > 0) {
            await cartController.mergeSessionCart(req.session.cart, customer.id);
            req.session.cart = [];
        }

        res.json({ success: true, message: 'OTP verified successfully' });
    } catch (error) {
        console.error('Error in postVerifyOTP:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

exports.getGoogleCallback = async (req, res) => {
    try {
        // Supabase handles the session automatically if we use their client
        // On the server side, we can get the session from the URL if it was passed
        // However, usually Supabase Auth with OAuth is handled on client-side.
        // But since we want to sync with OUR local session (Express), we need a bridge.

        // This route is called after Google redirects back.
        // The Supabase client on the frontend usually handles the hash fragment.
        // For a SSR setup, we might need a different approach.

        // Let's assume for now we are using the simple client-side data syncing.
        res.render('pages/auth-callback'); // We'll create a small EJS to handle the hash and redirect
    } catch (error) {
        console.error('Error in getGoogleCallback:', error);
        res.redirect('/login?error=auth_failed');
    }
};

exports.postSessionVerify = async (req, res) => {
    const { access_token } = req.body;

    if (!access_token) {
        return res.status(400).json({ success: false, error: 'Access token required' });
    }

    try {
        // Verify with Supabase
        const { data: { user }, error } = await supabase.auth.getUser(access_token);

        if (error || !user) {
            console.warn(`[Auth] Invalid access token from ${req.ip}`);
            return res.status(401).json({ success: false, error: 'Invalid token' });
        }

        const email = user.email;
        const fullName = user.user_metadata.full_name || email.split('@')[0];
        const supabase_id = user.id;

        let customer = await prisma.customer.findUnique({
            where: { email }
        });

        if (!customer) {
            customer = await prisma.customer.create({
                data: {
                    email,
                    fullName,
                    supabase_id,
                    status: 'Active'
                }
            });
        } else {
            customer = await prisma.customer.update({
                where: { email },
                data: {
                    supabase_id,
                    status: 'Active'
                }
            });
        }

        // Set session
        req.session.customerId = customer.id;
        req.session.customerName = customer.fullName;

        // Merge Cart
        if (req.session.cart && req.session.cart.length > 0) {
            await cartController.mergeSessionCart(req.session.cart, customer.id);
            req.session.cart = [];
        }

        req.session.save((err) => {
            if (err) {
                console.error('Session save error:', err);
                return res.status(500).json({ success: false, error: 'Session save error' });
            }
            res.json({ success: true, message: 'Session synced' });
        });
    } catch (error) {
        console.error('Error in postSessionVerify:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

exports.logout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).json({ success: false, error: 'Failed to logout' });
        }
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            res.json({ success: true, message: 'Logged out successfully' });
        } else {
            res.redirect('/login');
        }
    });
};

exports.postChangePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const customerId = req.session.customerId;

    if (!customerId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    try {
        const customer = await prisma.customer.findUnique({
            where: { id: customerId }
        });

        if (!customer) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // If user has a Supabase ID and NO local password hash (standard flow if using Supabase Auth mainly),
        // we might strictly rely on Supabase.
        // HOWEVER, our previous analysis suggests we are using a mix or migrating.
        // Let's check if we can update password via Supabase Admin API or local hash.
        // The register flow uses Supabase Auth. Login uses Supabase Auth.
        // So we MUST update password in Supabase.

        // But wait, the previous code shows we store almost NOTHING locally regarding auth secrets.
        // We only store profile info.
        // So we should try to update password via Supabase.

        // If the user is logged in, we should have their access token or session ideally.
        // But we rely on `req.session.customerId`. We might NOT have the Supabase session token here
        // unless we stored it.
        // If we don't have the token, we can't use `supabase.auth.updateUser` easily for the *current* user
        // without re-authenticating or using the service role key (Admin).

        // Looking at `postLogin`, we don't save the access_token in the session.
        // This is a limitation.

        // Strategy:
        // 1. If we have the Service Role Key (we likely do in `supabaseClient.js` if it's set up for admin),
        //    we can update the user by ID.
        // 2. BUT, we need to verify the `currentPassword` first to prompt it.
        //    We can't easily verify the old password without signing in again.

        // Alternative Strategy (Hybrid):
        // Since the user is ALREADY logged in (session exists), and we are in a trusted environment (backend),
        // AND validation of "Current Password" is requested:
        // We can try `signInWithPassword` with email + currentPassword.
        // If success -> Update password using the returned session.
        // If fail -> Wrong current password.

        // Edge Case: Google User (No password).
        // If they don't have a password, `signInWithPassword` will fail or is not applicable.
        // We need to know if they have a password. Supabase User object has `app_metadata.provider`.
        // We can fetch the user via Admin API to check providers.

        // Let's see if we can use the Service Role to fetch user details first.
        const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(customer.supabase_id);

        if (userError || !user) {
            // Fallback or error
            console.error('Error fetching supabase user:', userError);
            return res.status(500).json({ success: false, error: 'Authentication provider error' });
        }

        const providers = user.app_metadata.providers || [];
        const hasPassword = providers.includes('email');
        const isGoogleOnly = providers.includes('google') && !hasPassword;

        if (hasPassword && currentPassword) {
            // Verify current password by attempting a sign-in
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: customer.email,
                password: currentPassword
            });

            if (signInError) {
                return res.status(400).json({ success: false, error: 'Incorrect current password' });
            }
        } else if (hasPassword && !currentPassword) {
            return res.status(400).json({ success: false, error: 'Current password is required' });
        }

        // If we passed the check (or skipped it for Google-only users setting a pass for the first time),
        // Update the password.
        const { error: updateError } = await supabase.auth.admin.updateUserById(
            customer.supabase_id,
            { password: newPassword }
        );

        if (updateError) {
            return res.status(400).json({ success: false, error: updateError.message });
        }

        res.json({ success: true, message: 'Password updated successfully' });

    } catch (error) {
        console.error('Error in postChangePassword:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

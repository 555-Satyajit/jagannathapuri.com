const prisma = require('../../lib/prisma');
const bcrypt = require('bcryptjs');
const { logAction } = require('../../lib/auditLogger');

exports.getLogin = (req, res) => {
    res.render('pages/admin-login', {
        title: 'Login - Jagannatha-puri Admin',
        error: req.query.error
    });
};

exports.postLogin = async (req, res) => {
    const { 'email-username': emailOrUsername, password } = req.body;

    try {
        const user = await prisma.staff.findFirst({
            where: {
                OR: [
                    { email: emailOrUsername },
                    { username: emailOrUsername }
                ]
            },
            include: { role: true } // Include role for permissions
        });

        if (user) {
            if (user.status !== 'Active') {
                return res.redirect('/admin/login?error=Your account is inactive. Please contact Super Admin.');
            }

            // Verify Password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                await logAction(req, 'LOGIN_FAILED', 'Staff', user.id, `Failed login attempt with incorrect password for username: ${user.username}`);
                return res.redirect('/admin/login?error=Invalid email/username or password.');
            }

            req.session.admin = {
                id: user.id
                // Thin session: We only store ID. Middleware fetches the rest.
            };

            // Set Admin Session to expire after 6 hours
            req.session.cookie.maxAge = 6 * 60 * 60 * 1000;


            await logAction(req, 'LOGIN', 'Staff', user.id, `Admin logged in: ${user.username}`);

            // Force session save before redirect to prevent race conditions on fast redirects
            return req.session.save((err) => {
                if (err) console.error('Session save error:', err);
                res.redirect('/admin');
            });
        } else {
            await logAction(req, 'LOGIN_FAILED', 'Staff', null, `Failed login attempt for username: ${emailOrUsername}`);
            return res.render('pages/admin-login', { error: 'Invalid email/username or password.' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.redirect('/admin/login?error=System error. Please try again later.');
    }
};

exports.logout = async (req, res) => {
    if (req.session.admin) {
        await logAction(req, 'LOGOUT', 'Staff', req.session.admin.id, 'Admin logged out');
        req.session.destroy();
    }
    res.redirect('/admin/login');
};

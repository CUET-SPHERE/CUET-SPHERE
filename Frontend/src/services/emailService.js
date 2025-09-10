// Email service for handling Brevo integration
class EmailService {
  static async sendPasswordResetEmail(email, otp) {
    const brevoApiKey = import.meta.env.VITE_BREVO_API_KEY;
    const senderEmail = import.meta.env.VITE_BREVO_SENDER_EMAIL;

    if (!brevoApiKey || !senderEmail) {
      throw new Error('Brevo API key or sender email not configured');
    }

    const emailData = {
      sender: {
        name: 'CUET Sphere',
        email: senderEmail
      },
      to: [
        {
          email: email,
          name: email.split('@')[0]
        }
      ],
      subject: 'Password Reset OTP - CUET Sphere',
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset OTP</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
            .otp-box { background: white; border: 2px solid #2563eb; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
            .otp-code { font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 8px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎓 CUET Sphere</h1>
              <p>Password Reset Request</p>
            </div>
            <div class="content">
              <h2>Hello!</h2>
              <p>We received a request to reset your password for your CUET Sphere account.</p>
              <p>Please use the following 6-digit OTP to verify your identity:</p>
              
              <div class="otp-box">
                <div class="otp-code">${otp}</div>
              </div>
              
              <p><strong>Important:</strong></p>
              <ul>
                <li>This OTP is valid for 10 minutes only</li>
                <li>Do not share this code with anyone</li>
                <li>If you didn't request this reset, please ignore this email</li>
              </ul>
              
              <p>If you're having trouble, please contact our support team.</p>
            </div>
            <div class="footer">
              <p>© 2024 CUET Sphere. All rights reserved.</p>
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      textContent: `
        CUET Sphere - Password Reset OTP
        
        Hello!
        
        We received a request to reset your password for your CUET Sphere account.
        
        Your OTP: ${otp}
        
        This OTP is valid for 10 minutes only.
        Do not share this code with anyone.
        
        If you didn't request this reset, please ignore this email.
        
        © 2024 CUET Sphere. All rights reserved.
      `
    };

    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'api-key': brevoApiKey
        },
        body: JSON.stringify(emailData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send email');
      }

      const result = await response.json();
      return {
        success: true,
        messageId: result.messageId,
        message: 'OTP sent successfully'
      };
    } catch (error) {
      console.error('Email sending error:', error);
      throw new Error('Failed to send OTP email. Please try again.');
    }
  }

  static async sendWelcomeEmail(email, fullName) {
    const brevoApiKey = import.meta.env.VITE_BREVO_API_KEY;
    const senderEmail = import.meta.env.VITE_BREVO_SENDER_EMAIL;

    if (!brevoApiKey || !senderEmail) {
      console.warn('Brevo credentials not configured - skipping welcome email');
      return { success: true, message: 'Welcome email skipped' };
    }

    const emailData = {
      sender: {
        name: 'CUET Sphere',
        email: senderEmail
      },
      to: [
        {
          email: email,
          name: fullName
        }
      ],
      subject: 'Welcome to CUET Sphere!',
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to CUET Sphere</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎓 Welcome to CUET Sphere!</h1>
            </div>
            <div class="content">
              <h2>Hello ${fullName}!</h2>
              <p>Welcome to CUET Sphere - your academic community platform!</p>
              <p>You can now:</p>
              <ul>
                <li>📢 Stay updated with notices and announcements</li>
                <li>👥 Connect with your classmates and batch mates</li>
                <li>📚 Access and share academic resources</li>
                <li>🔔 Receive important notifications</li>
              </ul>
              <p>Get started by logging into your account and exploring the platform.</p>
              <p>If you have any questions, feel free to reach out to our support team.</p>
            </div>
            <div class="footer">
              <p>© 2024 CUET Sphere. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'api-key': brevoApiKey
        },
        body: JSON.stringify(emailData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Welcome email error:', errorData);
        // Don't throw error for welcome email failure
        return { success: false, message: 'Welcome email failed' };
      }

      const result = await response.json();
      return {
        success: true,
        messageId: result.messageId,
        message: 'Welcome email sent successfully'
      };
    } catch (error) {
      console.error('Welcome email error:', error);
      // Don't throw error for welcome email failure
      return { success: false, message: 'Welcome email failed' };
    }
  }
}

export default EmailService;
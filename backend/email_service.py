import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
FROM_EMAIL = os.getenv("FROM_EMAIL", "noreply@example.com")

def send_reset_email(to_email: str, reset_link: str, username: str = ""):
    """
    Send password reset email via SendGrid
    Returns True if sent successfully, False otherwise
    """
    
    if not SENDGRID_API_KEY:
        print("⚠️ Warning: SENDGRID_API_KEY not set")
        print(f"Reset link for {to_email}: {reset_link}")
        return False
    
    # Email HTML template
    html_content = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1976d2;">Password Reset Request</h2>
            
            <p>Hello{' ' + username if username else ''},</p>
            
            <p>You requested a password reset for your <strong>Loan Default Predictor</strong> account.</p>
            
            <p>Click the button below to reset your password:</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{reset_link}" 
                   style="background-color: #1976d2; color: white; padding: 12px 30px; 
                          text-decoration: none; border-radius: 5px; display: inline-block;">
                    Reset My Password
                </a>
            </div>
            
            <p>Or copy and paste this link in your browser:</p>
            <p style="background-color: #f5f5f5; padding: 10px; word-break: break-all;">
                {reset_link}
            </p>
            
            <p style="color: #666; font-size: 14px;">
                This link will expire in <strong>1 hour</strong> for security reasons.
            </p>
            
            <p style="color: #666; font-size: 14px;">
                If you didn't request this password reset, please ignore this email or 
                contact support if you have concerns.
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px;">
                This is an automated email from Loan Default Predictor.<br>
                Please do not reply to this email.
            </p>
        </div>
    </body>
    </html>
    """
    
    message = Mail(
        from_email=FROM_EMAIL,
        to_emails=to_email,
        subject='Password Reset - Loan Default Predictor',
        html_content=html_content
    )
    
    try:
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        response = sg.send(message)
        
        if response.status_code == 202:
            print(f"✅ Email sent successfully to {to_email}")
            return True
        else:
            print(f"⚠️ Email sent with status: {response.status_code}")
            return True
            
    except Exception as e:
        print(f"❌ Failed to send email: {str(e)}")
        print(f"Fallback link: {reset_link}")
        return False
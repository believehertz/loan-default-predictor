import os
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from pydantic import EmailStr

conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME", "your_gmail@gmail.com"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD", "your_app_password"),
    MAIL_FROM=os.getenv("MAIL_FROM", "your_gmail@gmail.com"),
    MAIL_PORT=int(os.getenv("MAIL_PORT", 587)),
    MAIL_SERVER=os.getenv("MAIL_SERVER", "smtp.gmail.com"),
    MAIL_STARTTLS=os.getenv("MAIL_STARTTLS", "True").lower() in ('true', '1', 't'),
    MAIL_SSL_TLS=os.getenv("MAIL_SSL_TLS", "False").lower() in ('true', '1', 't'),
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

async def send_reset_email(to_email: str, reset_link: str, username: str = ""):
    """
    Send password reset email via fastapi-mail
    """
    if conf.MAIL_PASSWORD == "your_app_password" or not conf.MAIL_PASSWORD:
        print("⚠️ Warning: MAIL_PASSWORD not properly set. Check .env")
        print(f"⚠️ To fix this, create a Gmail App Password:")
        print(f"⚠️ 1. Go to https://myaccount.google.com/security")
        print(f"⚠️ 2. Enable 2-Step Verification if not enabled")
        print(f"⚠️ 3. Go to App Passwords section")
        print(f"⚠️ 4. Create a new App Password named 'LoanGuard'")
        print(f"⚠️ 5. Copy the 16-character password and set it as MAIL_PASSWORD in .env")
        print(f"Reset link for {to_email}: {reset_link}")
        return False

    html_content = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #0f2b46;">Password Reset Request</h2>

            <p>Hello{' ' + username if username else ''},</p>

            <p>You requested a password reset for your <strong>LoanGuard</strong> account.</p>

            <p>Click the button below to reset your password:</p>

            <div style="text-align: center; margin: 30px 0;">
                <a href="{reset_link}"
                   style="background-color: #0f2b46; color: white; padding: 12px 30px;
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
                This is an automated email from LoanGuard.<br>
                Please do not reply to this email.
            </p>
        </div>
    </body>
    </html>
    """

    message = MessageSchema(
        subject="Password Reset - LoanGuard",
        recipients=[to_email],
        body=html_content,
        subtype=MessageType.html
    )

    fm = FastMail(conf)
    try:
        await fm.send_message(message)
        print(f"✅ Email sent successfully to {to_email}")
        return True
    except Exception as e:
        print(f"❌ Failed to send email: {str(e)}")
        print(f"Fallback link: {reset_link}")
        return False


async def send_loan_status_email(to_email: str, username: str, loan_id: int, status: str, rejection_reason: str = None):
    """
    Send loan status update email to borrower
    """
    if conf.MAIL_PASSWORD == "your_app_password" or not conf.MAIL_PASSWORD:
        print("⚠️ Warning: MAIL_PASSWORD not properly set. Check .env")
        print(f"Loan status update for {to_email}: Loan #{loan_id} - {status}")
        return False

    # Determine email content based on status
    if status == "APPROVED":
        subject = "🎉 Your Loan Application Has Been Approved!"
        status_color = "#10b981"
        status_text = "APPROVED"
        message_body = """
            <p>Great news! Your loan application has been <strong>approved</strong>.</p>
            <p>You will receive further instructions regarding loan disbursement.</p>
        """
    elif status == "REJECTED":
        subject = "Loan Application Update"
        status_color = "#ef4444"
        status_text = "REJECTED"
        message_body = f"""
            <p>We regret to inform you that your loan application has been <strong>rejected</strong>.</p>
            {f'<p><strong>Reason:</strong> {rejection_reason}</p>' if rejection_reason else ''}
            <p>If you have questions about this decision, please contact our support team.</p>
        """
    else:
        subject = "Loan Application Update"
        status_color = "#f59e0b"
        status_text = status
        message_body = f"""
            <p>Your loan application status has been updated to: <strong>{status}</strong>.</p>
            <p>Please check your dashboard for more details.</p>
        """

    html_content = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #0f2b46;">{subject}</h2>

            <p>Hello{' ' + username if username else ''},</p>

            <p>Your loan application <strong>#{loan_id}</strong> status has been updated.</p>

            <div style="background-color: {status_color}; color: white; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
                <h3 style="margin: 0; font-size: 24px;">{status_text}</h3>
            </div>

            {message_body}

            <p>You can view the full details of your application in your dashboard.</p>

            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

            <p style="color: #999; font-size: 12px;">
                This is an automated email from LoanGuard.<br>
                Please do not reply to this email.
            </p>
        </div>
    </body>
    </html>
    """

    message = MessageSchema(
        subject=subject,
        recipients=[to_email],
        body=html_content,
        subtype=MessageType.html
    )

    fm = FastMail(conf)
    try:
        await fm.send_message(message)
        print(f"✅ Loan status email sent successfully to {to_email}")
        return True
    except Exception as e:
        print(f"❌ Failed to send loan status email: {str(e)}")
        return False
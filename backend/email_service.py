import os
import smtplib
from email.message import EmailMessage

def _get_mail_config():
    return {
        "username": os.getenv("MAIL_USERNAME"),
        "password": os.getenv("MAIL_PASSWORD"),
        "from": os.getenv("MAIL_FROM", os.getenv("MAIL_USERNAME")),
        "server": os.getenv("MAIL_SERVER", "smtp.gmail.com"),
        "port": int(os.getenv("MAIL_PORT", "587")),
    }

def send_email_smtp(to_email: str, subject: str, html_content: str):
    cfg = _get_mail_config()
    if not cfg["username"] or not cfg["password"]:
        print("Warning: MAIL_USERNAME or MAIL_PASSWORD not properly set. Check .env")
        return False
        
    msg = EmailMessage()
    msg['Subject'] = subject
    msg['From'] = cfg["from"]
    msg['To'] = to_email
    msg.set_content("Please enable HTML to view this email.")
    msg.add_alternative(html_content, subtype='html')

    try:
        with smtplib.SMTP(cfg["server"], cfg["port"]) as server:
            server.starttls()
            server.login(cfg["username"], cfg["password"])
            server.send_message(msg)
        return True
    except Exception as e:
        print(f"Failed to send email via SMTP: {str(e)}")
        return False

async def send_reset_email(to_email: str, reset_link: str, username: str = ""):
    """
    Send password reset email via Gmail SMTP
    """
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
    
    success = send_email_smtp(to_email, "Password Reset - LoanGuard", html_content)
    if success:
        print(f"Email sent successfully to {to_email}")
    else:
        print(f"Fallback link: {reset_link}")
    return success


async def send_loan_status_email(to_email: str, username: str, loan_id: int, status: str, rejection_reason: str = None):
    """
    Send loan status update email to borrower via Gmail SMTP
    """
    # Determine email content based on status
    if status == "APPROVED":
        subject = "Your Loan Application Has Been Approved!"
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

    success = send_email_smtp(to_email, subject, html_content)
    if success:
        print(f"Loan status email sent successfully to {to_email}")
    return success
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from dotenv import load_dotenv
load_dotenv()

from email_service import send_email_sg

print(f"Testing SendGrid with API key: {os.getenv('SENDGRID_API_KEY')[:5]}...")
print(f"From email: {os.getenv('SENDGRID_FROM_EMAIL')}")
print("Attempting to send email...")

success = send_email_sg('believehertz@gmail.com', 'Test Email', '<p>Test</p>')
print(f"Success: {success}")

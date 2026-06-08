import os
from dotenv import load_dotenv
load_dotenv()

import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
from models import User
from email_service import send_email_smtp

db = SessionLocal()
users = db.query(User).all()
print("Users in DB:")
for u in users:
    print(f"- {u.email} (Username: {u.username})")

if users:
    print("\nTesting SMTP email...")
    print(f"MAIL_USERNAME is: {os.getenv('MAIL_USERNAME')}")
    success = send_email_smtp(users[0].email, "Test Subject", "<h1>Test</h1>")
    print(f"SMTP Success: {success}")
else:
    print("\nNo users to test email sending.")

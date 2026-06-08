import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from database import SessionLocal
from models import User
from datetime import datetime

db = SessionLocal()
users = db.query(User).filter(User.reset_token != None).all()
print("Users with tokens:")
for u in users:
    print(f"Email: {u.email}")
    print(f"Token: {u.reset_token}")
    print(f"Expires: {u.reset_token_expires} (Type: {type(u.reset_token_expires)})")
    
    now_utc = datetime.utcnow()
    print(f"Current UTC: {now_utc}")
    
    if u.reset_token_expires:
        try:
            # Native python comparison
            is_valid_py = u.reset_token_expires > now_utc
            print(f"Is Valid (Python)? {is_valid_py}")
        except Exception as e:
            print(f"Python comparison error: {e}")
            
    # SQLAlchemy comparison
    valid_user = db.query(User).filter(
        User.id == u.id,
        User.reset_token == u.reset_token,
        User.reset_token_expires > datetime.utcnow()
    ).first()
    print(f"Is Valid (SQLAlchemy)? {valid_user is not None}")

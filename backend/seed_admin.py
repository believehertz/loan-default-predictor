import sys
import os
import getpass
import traceback

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# We removed the masking try/except block. 
# If a package is missing, it will tell us exactly which one!
try:
    from database import SessionLocal, engine
    from models import User, UserRole, Base
except Exception as e:
    print("❌ CRASH: Could not load the database files.")
    print("Here is the REAL reason why:")
    print("-" * 40)
    traceback.print_exc()
    print("-" * 40)
    sys.exit(1)

from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def seed_admin():
    print("=" * 40)
    print("   🏦 Loan Predictor — Admin Seeder")
    print("=" * 40)

    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        existing = db.query(User).filter(User.role == UserRole.ADMIN).first()
        if existing:
            print(f"\n⚠️ Admin already exists: {existing.username} ({existing.email})")
            print("Nothing to do. Exiting.")
            return

        print("\n✅ No admin account found. Creating the first admin...\n")

        username = input("Username: ").strip()
        if not username:
            print("❌ ERROR: Username cannot be empty.")
            return

        email = input("Email: ").strip()
        if not email or "@" not in email:
            print("❌ ERROR: Enter a valid email address.")
            return

        password = getpass.getpass("Password (hidden): ")
        confirm  = getpass.getpass("Confirm password: ")

        if password != confirm:
            print("❌ ERROR: Passwords do not match.")
            return

        if len(password) < 8:
            print("❌ ERROR: Password must be at least 8 characters.")
            return

        if db.query(User).filter(User.username == username).first():
            print(f"❌ ERROR: Username '{username}' is already taken.")
            return

        if db.query(User).filter(User.email == email).first():
            print(f"❌ ERROR: Email '{email}' is already registered.")
            return

        admin = User(
            username=username,
            email=email,
            hashed_password=pwd_context.hash(password),
            role=UserRole.ADMIN,
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)

        print(f"\n✅ Admin '{username}' created successfully!")
        print("You can now log in at /login with these credentials. 🚀")

    except Exception as exc:
        db.rollback()
        print(f"\n❌ ERROR: {exc}")
        print("\nIf you see an Enum or column error, the database migration")
        print("may not have run yet. Check that the 'role' column exists in")
        print("the users table before re-running this script.")
    finally:
        db.close()

if __name__ == "__main__":
    seed_admin()
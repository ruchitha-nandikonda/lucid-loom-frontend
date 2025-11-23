"""
Migration script to add OTP fields to existing User table.
Run this once to add the new columns to your existing database.
"""
from sqlalchemy import text
from database import engine

def migrate():
    """Add OTP-related columns to users table if they don't exist"""
    with engine.connect() as conn:
        # Check if columns exist and add them if they don't
        try:
            # Check if otp_code column exists
            result = conn.execute(text("PRAGMA table_info(users)"))
            columns = [row[1] for row in result]
            
            if "otp_code" not in columns:
                print("Adding otp_code column...")
                conn.execute(text("ALTER TABLE users ADD COLUMN otp_code VARCHAR"))
                conn.commit()
                print("✅ Added otp_code column")
            
            if "otp_expires" not in columns:
                print("Adding otp_expires column...")
                conn.execute(text("ALTER TABLE users ADD COLUMN otp_expires DATETIME"))
                conn.commit()
                print("✅ Added otp_expires column")
            
            if "email_verified" not in columns:
                print("Adding email_verified column...")
                conn.execute(text("ALTER TABLE users ADD COLUMN email_verified VARCHAR DEFAULT 'False'"))
                # Update existing users to be verified
                conn.execute(text("UPDATE users SET email_verified = 'True' WHERE email_verified IS NULL"))
                conn.commit()
                print("✅ Added email_verified column and marked existing users as verified")
            
            print("\n✅ Migration complete!")
            
        except Exception as e:
            print(f"❌ Migration failed: {e}")
            conn.rollback()

if __name__ == "__main__":
    migrate()


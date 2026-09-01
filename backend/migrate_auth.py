from sqlalchemy import text
from app.database.connection import engine

def migrate():
    with engine.begin() as conn:
        print("Starting migration...")
        # Create auth_users table
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS auth_users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(150) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """))
        print("Created auth_users table.")
        
        # Check if users table has password_hash
        res = conn.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='users' and column_name='password_hash';
        """)).fetchone()
        
        if res:
            print("Migrating data from users to auth_users...")
            # Insert users who have a password
            conn.execute(text("""
                INSERT INTO auth_users (name, email, password_hash, created_at)
                SELECT name, email, password_hash, created_at
                FROM users
                WHERE password_hash IS NOT NULL
                ON CONFLICT (email) DO NOTHING;
            """))
            # Drop the column
            conn.execute(text("ALTER TABLE users DROP COLUMN password_hash;"))
            print("Dropped password_hash from users table.")
        else:
            print("Users table already clean.")
            
    print("Migration complete!")

if __name__ == "__main__":
    migrate()

import os
import sys
import django
from django.db import IntegrityError, transaction
from django.contrib.auth import get_user_model

def list_admin_users():
    """List all admin users in the system"""
    User = get_user_model()
    admins = User.objects.filter(is_superuser=True).order_by('date_joined')
    
    if not admins.exists():
        print("\nNo admin users found in the system.")
        return []
    
    print("\n" + "="*80)
    print("EXISTING ADMIN USERS")
    print("="*80)
    for i, admin in enumerate(admins, 1):
        print(f"\n[{i}] {admin.email}")
        print(f"   Name:   {admin.name}")
        print(f"   Mobile: {admin.mobile}")
        print(f"   Active: {'✅' if admin.is_active else '❌'}")
        print(f"   Last Login: {admin.last_login or 'Never'}")
    print("\n" + "="*80)
    return list(admins)

def create_or_update_admin(email, password, name="Admin User", mobile=None, force=False):
    """
    Create or update an admin user
    Returns (user, created_or_updated, message)
    """
    User = get_user_model()
    
    # Generate a random mobile if not provided
    if not mobile:
        import random
        mobile = f"+91{random.randint(7000000000, 9999999999)}"
    
    with transaction.atomic():
        # Try to get existing user by email or mobile
        user = User.objects.filter(email=email).first() or \
               User.objects.filter(mobile=mobile).first()
        
        if user:
            if not force and user.email != email:
                return None, False, f"Mobile {mobile} already exists for another user: {user.email}"
            
            # Update existing user
            user.email = email
            user.name = name
            user.mobile = mobile
            user.set_password(password)
            user.is_staff = True
            user.is_superuser = True
            user.is_active = True
            action = "Updated"
        else:
            # Create new user
            user = User.objects.create_user(
                email=email,
                name=name,
                mobile=mobile,
                password=password,
                is_staff=True,
                is_superuser=True,
                is_active=True
            )
            action = "Created"
        
        try:
            user.save()
            return user, True, f"{action} admin user: {email}"
        except IntegrityError as e:
            return None, False, f"Error: {str(e)}"

def main():
    # Set up Django environment first
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'campusconnect.settings')
    django.setup()
    
    # List existing admin users first
    admins = list_admin_users()
    
    # Get user input for new admin
    print("\n" + "="*80)
    print("CREATE NEW ADMIN USER")
    print("="*80)
    
    email = input(f"\nEnter admin email [admin@campusconnect.com]: ") or "admin@campusconnect.com"
    name = input(f"Enter admin name [Admin User]: ") or "Admin User"
    mobile = input(f"Enter mobile number (with country code, e.g., +91XXXXXXXXXX): ")
    password = input(f"Enter password [admin123]: ") or "admin123"
    
    print("\n" + "="*80)
    print("CREATING ADMIN USER...")
    print("="*80)
    
    # Create/update admin
    user, success, message = create_or_update_admin(
        email=email,
        name=name,
        mobile=mobile,
        password=password,
        force=True  # Force update if email/mobile exists
    )
    
    if user:
        print(f"\n✅ {message}")
        print("\nAdmin user details:")
        print("-"*40)
        print(f"Email:    {user.email}")
        print(f"Name:     {user.name}")
        print(f"Mobile:   {user.mobile}")
        print(f"Password: {password}")
        print("\nYou can now log in with these credentials.")
    else:
        print(f"\n❌ {message}")
        print("\nPlease try again with different credentials.")
    
    print("\n" + "="*80)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nOperation cancelled by user.")
        sys.exit(1)
    except Exception as e:
        print(f"\nAn error occurred: {str(e)}")
        sys.exit(1)

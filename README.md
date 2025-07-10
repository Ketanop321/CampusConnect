# CampusConnect Platform

A comprehensive campus management platform built with Django and Django REST Framework, designed to facilitate various campus activities and services.

## 🚀 Key Features

### 1. User Authentication & Authorization
- JWT-based authentication system
- User registration and profile management
- Role-based access control

### 2. Lost & Found System
- Report lost or found items
- Search and claim items
- Image upload support
- Status tracking (lost/found/claimed)

### 3. Book Bank
- Book listings and requests
- Book exchange platform
- Book status tracking

### 4. Notice Board (Upcoming)
- Event management
- Event registration
- Comments and discussions

### 5. Roommate Finder (Upcoming)
- Room listing and searching
- Profile matching
- Contact system

## 🛠️ Tech Stack

### Backend
- **Framework**: Django 4.1.13
- **REST API**: Django REST Framework 3.14.0
- **Authentication**: JWT (djangorestframework-simplejwt)
- **Database**: SQLite (Development), MongoDB (Planned for production)
- **CORS**: django-cors-headers

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- pip (Python package manager)
- Git (for version control)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CampusConnect
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**
   Create a `.env` file in the project root and add:
   ```
   SECRET_KEY=your-secret-key-here
   DEBUG=True
   ```

4. **Apply migrations**
   ```bash
   python manage.py migrate
   ```

5. **Create superuser**
   ```bash
   python manage.py createsuperuser
   ```

6. **Run the development server**
   ```bash
   python manage.py runserver
   ```

7. **Access the application**
   - API: http://127.0.0.1:8000/api/
   - Admin: http://127.0.0.1:8000/admin/

## 📚 API Documentation

### Authentication
- `POST /api/token/` - Obtain JWT token (login)
- `POST /api/token/refresh/` - Refresh JWT token
- `POST /api/token/verify/` - Verify JWT token

### User Management
- `POST /api/accounts/register/` - Register new user
- `GET /api/accounts/profile/` - Get user profile
- `PATCH /api/accounts/profile/` - Update profile
- `POST /api/accounts/change-password/` - Change password

### Lost & Found
- `GET /api/lostfound/items/` - List all items
- `POST /api/lostfound/items/` - Create new item
- `GET /api/lostfound/items/{id}/` - Get item details
- `PATCH /api/lostfound/items/{id}/` - Update item
- `DELETE /api/lostfound/items/{id}/` - Delete item
- `POST /api/lostfound/items/{id}/mark_found/` - Mark item as found
- `POST /api/lostfound/items/{id}/claim/` - Claim an item
- `POST /api/lostfound/items/{id}/unclaim/` - Unclaim an item

## 🏗️ Project Structure

```
CampusConnect/
├── accounts/                  # User authentication and profiles
├── bookbank/                  # Book exchange system
├── campusconnect/             # Project configuration
├── lostfound/                 # Lost & found system
├── noticeboard/               # Event management (upcoming)
├── roommate/                  # Roommate finder (upcoming)
├── manage.py                  # Django management script
├── requirements.txt           # Project dependencies
└── README.md                  # This file
```

## 🔧 Configuration

### Environment Variables
- `SECRET_KEY`: Django secret key
- `DEBUG`: Debug mode (True/False)
- `ALLOWED_HOSTS`: Comma-separated list of allowed hosts
- `CORS_ALLOWED_ORIGINS`: Allowed CORS origins
- `DATABASE_URL`: Database connection URL

### Settings
Key settings can be found in `campusconnect/settings.py`:
- Database configuration
- Installed apps
- Middleware
- Authentication backends
- CORS settings

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

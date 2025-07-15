<p align="center">
   <img src="https://cimage.in/content/themes/qeducato/inc/assets/images/logoc.png"/>
</p>

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
   (Alternative for above). **IF Above command doesn't work and give error | Put the below command respectively to terminal Error** 
   ```bash
   pip install django-cors-headers
    ```
   ```bash
   pip install djangorestframework-simplejwt
   ```
    ```bash
   pip install django-filter==25.1
t
   ```

3. **Apply migrations**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

4. **Create superuser**
   ```bash
   python manage.py createsuperuser
   ```

5. **Run the development server**
   ```bash
   python manage.py runserver
   ```

6. **Access the application**
   - API: http://127.0.0.1:8000/api/
   - Admin: http://127.0.0.1:8000/admin/


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

---

# Documentation

- [Frontend Documentation](./FrontendDocumentation.md)
- [Backend Documentation](./BackendDocumentation.md)

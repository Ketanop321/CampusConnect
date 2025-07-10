# CampusConnect Platform Documentation

## 📖 Table of Contents
1. [Project Overview](#-project-overview)
2. [System Architecture](#-system-architecture)
3. [Database Schema](#-database-schema)
4. [API Documentation](#-api-documentation)
5. [Setup Guide](#-setup-guide)
6. [Development Workflow](#-development-workflow)
7. [Testing](#-testing)
8. [Deployment](#-deployment)
9. [Troubleshooting](#-troubleshooting)
10. [Future Enhancements](#-future-enhancements)

## 🌟 Project Overview

CampusConnect is a comprehensive campus management platform designed to facilitate various campus activities including lost & found services, book exchange, event management, and roommate finding.

### Core Features
- **User Management**: Secure authentication and profile management
- **Lost & Found**: Digital platform for reporting and claiming lost items
- **Book Bank**: System for sharing and exchanging books
- **Notice Board**: Event management and announcements (upcoming)
- **Roommate Finder**: Platform to find compatible roommates (upcoming)

## 🏗 System Architecture

### Backend Architecture
- **Framework**: Django 4.1.13
- **API**: Django REST Framework 3.14.0
- **Authentication**: JWT-based authentication
- **Database**: SQLite (Development), MongoDB (Production)
- **Caching**: Redis (Planned)
- **Task Queue**: Celery (Planned)

### Frontend Architecture (Planned)
- **Framework**: React.js
- **State Management**: Redux
- **UI Components**: Material-UI
- **Routing**: React Router

## 🗃 Database Schema

### Accounts App
```mermaid
erDiagram
    USER ||--o{ USER_PROFILE : has
    USER {
        string email PK
        string password
        string name
        string mobile
        string address
        datetime date_joined
        datetime last_login
        bool is_active
        bool is_staff
        bool is_superuser
    }
    USER_PROFILE {
        int id PK
        int user_id FK
        string profile_picture
        string bio
        string department
        string student_id
        datetime created_at
        datetime updated_at
    }
```

### Lost & Found App
```mermaid
erDiagram
    LOST_FOUND_ITEM ||--o{ USER : reported_by
    LOST_FOUND_ITEM {
        uuid id PK
        string item_name
        text description
        string status
        string location
        datetime date_reported
        datetime date_occurred
        int reporter_id FK
        int claimed_by_id FK
        bool is_resolved
        string image
        string contact_info
        string category
        string color
        string brand
        datetime created_at
        datetime updated_at
    }
```

## 📚 API Documentation

### Authentication

#### Login
```http
POST /api/token/
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "password123"
}
```

#### Response
```json
{
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Lost & Found Endpoints

#### List All Items
```http
GET /api/lostfound/items/
Authorization: Bearer your_access_token
```

#### Create New Item
```http
POST /api/lostfound/items/
Authorization: Bearer your_access_token
Content-Type: application/json

{
    "item_name": "Lost Phone",
    "description": "Black iPhone 13",
    "status": "lost",
    "location": "Library",
    "contact_info": "user@example.com"
}
```

## 🛠 Setup Guide

### Prerequisites
- Python 3.8+
- pip (Python package manager)
- Git
- Virtual Environment (recommended)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CampusConnect
   ```

2. **Set up a virtual environment (recommended)**
   ```bash
   # Windows
   python -m venv venv
   .\venv\Scripts\activate
   
   # macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   Create a `.env` file in the project root:
   ```
   SECRET_KEY=your-secret-key-here
   DEBUG=True
   ALLOWED_HOSTS=localhost,127.0.0.1
   ```

5. **Apply database migrations**
   ```bash
   python manage.py migrate
   ```

6. **Create a superuser**
   ```bash
   python manage.py createsuperuser
   ```

7. **Run the development server**
   ```bash
   python manage.py runserver
   ```

8. **Access the application**
   - API: http://127.0.0.1:8000/api/
   - Admin: http://127.0.0.1:8000/admin/

### Git Workflow
1. Create a new branch for your feature
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Make your changes and commit
   ```bash
   git add .
   git commit -m "Add your commit message"
   ```
3. Push your changes
   ```bash
   git push origin feature/your-feature-name
   ```
4. Create a pull request

## 🧪 Testing

### Running Tests
```bash
python manage.py test
```

### Test Coverage
```bash
coverage run --source='.' manage.py test
coverage report
```

### Environment Variables
```
DEBUG=False
SECRET_KEY=your-production-secret-key
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
DATABASE_URL=postgres://user:password@localhost:5432/dbname
```

## 🐛 Troubleshooting

### Common Issues
1. **Migrations not applying**
   ```bash
   python manage.py migrate --fake-initial
   ```

2. **Static files not loading**
   ```bash
   python manage.py collectstatic
   ```

3. **Port already in use**
   ```bash
   # Find the process
   netstat -ano | findstr :8000
   # Kill the process
   taskkill /PID <PID> /F
   ```

## 🚧 Future Enhancements

### Planned Features
- [ ] Real-time notifications
- [ ] Chat system
- [ ] File uploads to cloud storage
- [ ] Advanced search functionality
- [ ] Mobile app (React Native)

### Performance Improvements
- [ ] Implement caching
- [ ] Database query optimization
- [ ] API response compression

## 🙏 Acknowledgments

- Django and Django REST Framework teams
- All contributors and testers
- The open-source community for their valuable packages and tools

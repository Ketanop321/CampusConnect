# CampusConnect Platform Documentation

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
- **Database**: SQLite (Development), MongoDB 
### Frontend Architecture (Planned)
- **Framework**: React.js
- **State Management**: Redux
- **UI Components**: Material-UI
- **Routing**: React Router

## 🗃 Database Schema

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

---

## 🗂 Backend Folder Structure & Responsibilities

Below is an overview of the backend folder structure. Each folder and key file is described with its purpose and how it connects to the rest of the application.

| Path | Type | Purpose & Connections |
|------|------|----------------------|
| `backend/` | Folder | Root backend folder containing all Django project files and apps. |
| `backend/manage.py` | File | Django's management script for running server, migrations, etc. Entry point for most backend commands. |
| `backend/requirements.txt` | File | Lists all Python dependencies required to run the backend. Used by `pip install -r requirements.txt`. |
| `backend/accounts/` | App Folder | Handles user authentication, registration, profile management. Connects with all user-based features (Lost & Found, BookBank, etc). |
| `backend/accounts/models.py` | File | Defines custom user model and user profile. Central to authentication and user data. |
| `backend/accounts/serializers.py` | File | Converts user and profile models to/from JSON for API use. Used in views and DRF endpoints. |
| `backend/accounts/views.py` | File | Contains API logic for registration, login, profile, etc. Connects with frontend via REST API. |
| `backend/accounts/permissions.py` | File | Custom permission classes for user access control. |
| `backend/accounts/urls.py` | File | Routes API endpoints for user-related operations. Included in project-level `urls.py`. |
| `backend/bookbank/` | App Folder | Manages book exchange and sharing features. Connects to `accounts` for user ownership. |
| `backend/lostfound/` | App Folder | Handles lost & found item reporting, claiming, and status. Relates to `accounts` for reporter/claimer. |
| `backend/noticeboard/` | App Folder | (Planned) Event and announcement management. Will connect to `accounts` for authoring/admin. |
| `backend/roommate/` | App Folder | (Planned) Roommate search and matching. Connects to `accounts` for user profiles. |
| `backend/campusconnect/` | Project Folder | Django project settings and configuration. |
| `backend/campusconnect/settings.py` | File | Main Django settings (databases, installed apps, middleware, etc). Controls all backend behavior. |
| `backend/campusconnect/urls.py` | File | Root URL router; includes app-specific routers. Connects frontend and backend APIs. |
| `backend/campusconnect/wsgi.py`<br>`backend/campusconnect/asgi.py` | File | Entry points for WSGI/ASGI servers (deployment, async support). |
| `backend/db.sqlite3` | File | Default development database (SQLite). Swappable for production DB. |
| `backend/*/migrations/` | Folder | Tracks database schema changes for each app. Required for Django ORM. |

**How these connect:**
- `accounts` is central: nearly all apps reference users for ownership, permissions, and profile info.
- Each app (e.g. `bookbank`, `lostfound`) defines its own models, serializers, views, and urls, but relies on `accounts` for user context.
- `campusconnect/settings.py` and `urls.py` tie all apps together and expose the API to the frontend.
- `migrations` folders ensure database schema is consistent and versioned.

---

## 🔄 Backend Data Workflow

This section explains how data is handled in the CampusConnect backend—from receiving a request, to processing, storing, and returning data.

### 1. Client Request (Frontend or API Consumer)
- The client (such as the React frontend or a mobile app) sends an HTTP request to the backend API (e.g., via `fetch`, `axios`, or a form submission).
- Example: A user submits a registration form or reports a lost item.

### 2. URL Routing
- The Django backend receives the request at a specific endpoint (e.g., `/api/accounts/register/`, `/api/lostfound/items/`).
- The request is routed via `urls.py` in the relevant app (e.g., `accounts/urls.py`, `lostfound/urls.py`), which maps the URL to a view.

### 3. View Logic
- The view (usually a Django REST Framework APIView, ViewSet, or function) handles the request.
- It parses request data (JSON, form data, etc.), authenticates the user (if required), and applies permissions.
- Example: `LostFoundItemViewSet.create()` handles POST requests to create a new lost item.

### 4. Serialization & Validation
- The view passes the incoming data to a **serializer** (e.g., `LostFoundItemSerializer`).
- The serializer validates the data (types, required fields, business rules).
- If valid, the serializer converts the data into a Django model instance.

### 5. Database Operations
- The serializer or view saves the validated data to the database using Django ORM.
- Data is stored in the appropriate table (e.g., `User`, `LostFoundItem`, `UserProfile`).
- For reads (GET requests), data is queried from the database, serialized, and prepared for the response.

### 6. Response Serialization
- The serializer converts Django model instances (or querysets) back into JSON.
- The view returns an HTTP response with the serialized data (usually JSON) and the appropriate status code.

### 7. Client Receives Response
- The frontend receives the response and updates the UI accordingly (e.g., shows a success message, displays a list of items, etc.).

---

### 🔗 Example: Reporting a Lost Item

1. **User fills out the lost item form** in the frontend and clicks submit.
2. **Frontend sends a POST request** to `/api/lostfound/items/` with the item data.
3. **URL is routed** to the `LostFoundItemViewSet.create()` method.
4. **Serializer validates** the input (e.g., checks required fields, user ownership).
5. **Data is saved** to the `LostFoundItem` table in the database.
6. **A response is sent** back to the frontend confirming creation, including the new item’s data.

---

**Key Points:**
- **Authentication**: Most endpoints require JWT authentication. The backend checks the token and user permissions before processing.
- **Validation**: All input data is validated before being saved to the database, preventing bad or malicious data.
- **Separation of Concerns**: Views handle logic, serializers handle data transformation/validation, models handle storage.
- **Extensibility**: New features can be added by creating new models, serializers, views, and URLs.

---

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
   python manage.py makemigrations
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

### Environment Variables
```
DEBUG=False
SECRET_KEY=your-production-secret-key
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
DATABASE_URL=postgres://user:password@localhost:5432/dbname
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

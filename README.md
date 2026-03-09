# Job Portal & Applicant Tracking System (ATS) - Backend

A powerful, production-ready backend for a modern Job Portal with a built-in Applicant Tracking System (ATS). Developed with a focus on role-based security, real-time tracking, and comprehensive analytics using Django REST Framework.

## 🚀 Features

### For Employers

- **Job Posting**: Create, edit, and manage job postings
- **Application Management**: View and manage applications for posted jobs
- **Status Updates**: Update application status through the ATS workflow
- **Interview Scheduling**: Schedule and manage candidate interviews
- **Dashboard**: View job statistics and recent applications

### For Candidates

- **Job Browsing**: Search and browse available job postings
- **Application Submission**: Apply to jobs with resume upload
- **Application Tracking**: Track application status in real-time
- **Profile Management**: Manage personal profile information

### For Administrators
- **Platform Analytics**: High-level Overview with animated KPI distribution charts
- **User Management**: Advanced directory to monitor and manage all platform participants
- **System Monitoring**: Track active jobs, total applications, and interview throughput
- **Role-Based Routing**: Dedicated protected routes for administrative tasks

## 🛠️ Tech Stack

### Backend Core
- **Framework**: Django 4.2+ (Python 3.8+)
- **REST Engine**: Django REST Framework
- **Auth**: JWT (JSON Web Tokens) with Simple JWT & Role-Based Access Control
- **Database**: MySQL (Primary) with SQLite support for rapid development
- **Documentation**: Interactive Swagger & ReDoc (drf-yasg)
- **Security**: Rate limiting, CORS protection, and secure status transitions

### Frontend

- **Framework**: React with Vite
- **Routing**: React Router
- **State Management**: React Context API
- **HTTP Client**: Axios
- **UI**: Custom CSS with modern design
- **Notifications**: React Hot Toast

## 📋 Prerequisites

- Python 3.8+
- Node.js 16+
- MySQL 5.7+ (or use SQLite for development)
- pip (Python package manager)
- npm or yarn

## 🔧 Installation & Setup

### Backend Setup

1. **Navigate to backend directory**:

   ```bash
   cd backend
   ```

2. **Create virtual environment** (recommended):

   ```bash
   python -m venv venv

   # On Windows
   venv\Scripts\activate

   # On Linux/Mac
   source venv/bin/activate
   ```

3. **Install dependencies**:

   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**:
   Create a `.env` file in the `ats_backend` directory:

   ```env
   SECRET_KEY=your-secret-key-here
   DEBUG=True
   DB_NAME=job_portal_db
   DB_USER=root
   DB_PASSWORD=your-mysql-password
   DB_HOST=localhost
   DB_PORT=5432

   # Email Configuration (optional)
   EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USE_TLS=True
   EMAIL_HOST_USER=your-email@gmail.com
   EMAIL_HOST_PASSWORD=your-app-password
   DEFAULT_FROM_EMAIL=your-email@gmail.com
   ```

5. **Database Setup**:

   **Option A: MySQL** (Recommended for production)

   ```bash
   # Create database
   mysql -u root -p
   CREATE DATABASE job_portal_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   EXIT;
   ```

   **Option B: SQLite** (For development)
   - Uncomment SQLite configuration in `settings.py`
   - Comment out MySQL configuration

6. **Run migrations**:

   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

7. **Create superuser**:

   ```bash
   python manage.py createsuperuser
   ```

   Follow the prompts to create an admin account.

8. **Run development server**:
   ```bash
   python manage.py runserver
   ```
   Backend will be available at `http://localhost:8000`

## 📚 API Endpoints Overview

All API endpoints are prefixed with `/api/`.

### 1. Users & Authentication (`/api/users/`)
| Endpoint | Method | Role Access | Description |
| :--- | :--- | :--- | :--- |
| `/register/` | POST | Public | Register a new user |
| `/login/` | POST | Public | Authenticate & get JWT tokens |
| `/profile/` | GET | Authenticated | Get current user's profile |
| `/logout/` | POST | Authenticated | Invalidate refresh token |
| `/change-password/` | POST | Authenticated | Update account password |
| `/forgot-password/` | POST | Public | Request password reset email |
| `/reset-password/<uid>/<token>/` | POST | Public | Reset password using link |
| `/verify-email/` | POST | Authenticated | Send verification email |
| `/verify-email/<uid>/<token>/` | GET | Public | Verify user email address |

### 2. Job Management (`/api/jobs/`)
| Endpoint | Method | Role Access | Description |
| :--- | :--- | :--- | :--- |
| `/list/` | GET | Public | List all available job postings |
| `/create/` | POST | Employer | Create a new job posting |
| `/<id>/` | GET | Public | View detailed job information |
| `/update/<id>/` | PUT/PATCH | Employer | Modify an existing job |
| `/delete/<id>/` | DELETE | Employer | Remove a job posting |

### 3. Application Tracking (`/api/applications/`)
| Endpoint | Method | Role Access | Description |
| :--- | :--- | :--- | :--- |
| `/apply/` | POST | Candidate | Submit application with resume |
| `/my-applications/` | GET | Candidate | View candidate's application history |
| `/job/<job_id>/applications/` | GET | Employer | List applicants for a specific job |
| `/update-status/<id>/` | PATCH | Employer | Update application status & notify |

### 4. Interview Scheduling (`/api/interviews/`)
| Endpoint | Method | Role Access | Description |
| :--- | :--- | :--- | :--- |
| `/schedule/` | POST | Employer | Create interview window for candidate |
| `/select-slot/<id>/` | PATCH | Candidate | Choose slot & generate meeting link |
| `/employer/` | GET | Employer | List interviews created by employer |
| `/candidate/` | GET | Candidate | List interviews assigned to candidate |

### 5. Admin Dashboard (`/api/dashboard/`)
| Endpoint | Method | Role Access | Description |
| :--- | :--- | :--- | :--- |
| `/kpis/` | GET | Admin | Retrieve platform-wide metrics |
| `/users/` | GET | Admin | View/manage platform members |

---

## 📖 Automated Documentation

Interactive API documentation is automatically generated. You can explore and test the endpoints directly:

- **Swagger UI**: [http://localhost:8000/swagger/](http://localhost:8000/swagger/)
- **ReDoc**: [http://localhost:8000/redoc/](http://localhost:8000/redoc/)

---

## 🔧 Django Admin Panel

Access Django's built-in admin interface for database management:

- **Admin Panel**: `http://localhost:8000/admin/`
- **Login**: Use your superuser credentials (created with `python manage.py createsuperuser`)

**Note**: The Django admin panel (`/admin/`) is different from the custom Admin Dashboard (`/admin/dashboard`):

- **Django Admin** (`/admin/`): Database management interface for all models

## 🔐 User Roles

The system supports three user roles:

1. **CANDIDATE**: Job seekers who can browse and apply to jobs
2. **EMPLOYER**: Companies/recruiters who can post jobs and manage applications
3. **ADMIN**: System administrators with full access to all features

### Role-Based Access Control

- **Candidates**: Can only access candidate-specific routes
- **Employers**: Can only access employer-specific routes
- **Admins**: Can only access admin-specific routes (separate admin dashboard)

## 🎨 Admin Dashboard Features

The admin dashboard provides comprehensive system management:

### Dashboard Overview

- **KPIs**: Total users, employers, candidates, active jobs, total applications, interviews scheduled today

### Job Moderation

- View all job postings
- Approve/reject or enable/disable jobs
- Filter by active status

### Application Monitoring

- View all applications across the platform
- Filter by status and job ID
- Track application pipeline bottlenecks

### Analytics

- **Job Analytics**: Jobs posted per day, total/active/inactive counts
- **Application Analytics**: Applications per day, applications per job, status breakdown

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Strict permission system
- **Rate Limiting**: Admin endpoints rate-limited (100 requests/minute)
- **Audit Logging**: All critical actions are logged
- **IP Tracking**: User IP addresses recorded for security
- **Self-Protection**: Admins cannot deactivate their own accounts
- **Password Validation**: Strong password requirements
- **CORS Protection**: Configured for secure cross-origin requests

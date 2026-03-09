# Job Portal & ATS - Frontend Interface

A premium, high-performance React.js frontend for the Job Portal Applicant Tracking System (ATS). Designed with visual excellence, smooth interactions, and robust role-based navigation.

## 🚀 Features

- **Premium Admin Hub**: High-level platform overview with animated KPI distribution charts
- **ATS Workflow**: Full application lifecycle management from APPLIED to SELECTED/REJECTED
- **Smart Interviewing**: Drag-and-drop slot selection for candidates with `react-datepicker`
- **Visual Analytics**: Interactive bar charts for platform metrics powered by Framer Motion
- **Role-Based Access**: Specialized interfaces for Candidates, Employers, and Super Admins

## 📦 Tech Stack

- **React 18** - Core Library
- **Vite** - High-speed Build Tool
- **Framer Motion** - Premium Animations & Transitions
- **Lucide React** - Modern Iconography System
- **React Datepicker** - Precision Date/Time Selection
- **Axios** - Interceptor-based API Communication
- **React Hot Toast** - Real-time Feedback System

## 🛠️ Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   Create a `.env` file in the root directory:
   ```env
   VITE_API_BASE_URL=http://localhost:8000/api
   VITE_BASE_NAME=/applicant-tracking-system/frontend
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:8081` or `http://localhost:8081/applicant-tracking-system/frontend`

## 🏗️ Project Structure

```
ats_frontend/
├── src/
│   ├── components/          # Reusable UI components
│   ├── pages/               # Page components
│   │   ├── auth/           # Authentication pages
│   │   ├── candidate/      # Candidate-specific pages
│   │   ├── employer/       # Employer-specific pages
│   │   └── admin/          # Admin-specific pages
│   ├── services/           # API service layer
│   ├── styles/             # Global styles
│   ├── App.jsx             # Main app component
│   └── main.jsx            # Entry point
├── package.json
├── vite.config.js
└── README.md
```

## 🔐 Authentication

The app uses JWT tokens for authentication:

- **Access Token**: Valid for 2 hour, stored in localStorage
- **Refresh Token**: Valid for 7 days, used to refresh access token
- **Auto-refresh**: Automatically refreshes expired tokens
- **Auto-logout**: Logs out user when refresh token expires

## 📱 User Roles

### Candidate
- Browse and search jobs
- Apply to jobs with resume upload
- Track application status
- View interview details
- Schedule interview according to their personal slot

### Employer
- Post and manage job listings
- View applications per job
- Update application status (ATS workflow)
- Schedule interviews
- View candidate resumes

### Admin
- Full access to all features

## 🎨 UI Components

### Reusable Components
- **Textarea**: Multi-line text input
- **Card**: Container component with hover effects
- **Modal**: Modal dialog for confirmations and forms
- **FileUpload**: Drag-and-drop file upload with progress
- **StatusBadge**: Visual status indicators
- **LoadingSpinner**: Loading states

## 🔄 ATS Workflow

The application follows a standard ATS workflow:

1. **APPLIED** → Candidate submits application
2. **SHORTLISTED** → Employer shortlists candidate
3. **INTERVIEW** → Interview scheduled
4. **SELECTED** or **REJECTED** → Final decision

Status transitions are validated on both frontend and backend.

## 📡 API Integration

All API calls are handled through service layers:

- `auth.service.js` - Authentication endpoints
- `admin.service.js` - Admin Management endpoints
- `candidate.service.js` - Candidate endpoints
- `employer.service.js` - employer endpoints

The API client (`api.js`) includes:
- Automatic token injection
- Token refresh on 401 errors
- Error handling and toast notifications
- Request/response interceptors

## 🎯 Key Features

### For Candidates
- **Job Search**: Search and filter jobs by title, location, skills
- **Application Tracking**: Real-time status updates
- **Resume Management**: Upload and manage resumes
- **Interview Calendar**: View scheduled interviews and select their personal time slot

### For Employers
- **Job Posting**: Create detailed job postings
- **Applicant Management**: View and manage all applicants
- **Status Pipeline**: Visual ATS workflow management
- **Interview Scheduling**: Schedule interviews with meeting links
- **Analytics Dashboard**: View job and application statistics

## 📝 Environment Variables

- `VITE_API_BASE_URL`: Backend API base URL (default: `http://localhost:8000/api`)
-  `VITE_BASE_NAME` : /applicant-tracking-system/frontend


## 🔧 Development

### Running the Dev Server
```bash
npm run dev
```

### Building for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```


### CORS Issues
Make sure your Django backend has CORS configured to allow requests from `http://localhost:8081`.

### Token Refresh Issues
If token refresh fails, check that the backend refresh endpoint is accessible and the refresh token is valid.

### API Connection Issues
Verify that:
1. Backend server is running on the correct port
2. `VITE_API_BASE_URL` is correctly set
3. Backend CORS settings allow the frontend origin

## 👥 Contributing

This is a production-ready frontend implementation. Follow React best practices and maintain code quality standards.

---



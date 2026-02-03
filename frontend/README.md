# Frontend Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Start Development Server
```bash
npm start
```

App opens at `http://localhost:3000`

## Project Structure

```
frontend/
├── public/
│   └── index.html        # HTML template
├── src/
│   ├── pages/            # Page components
│   │   ├── Home.js
│   │   ├── Login.js
│   │   ├── AdminDashboard.js
│   │   ├── MentorDashboard.js
│   │   ├── MentorMentees.js
│   │   ├── MentorMeetings.js
│   │   ├── MentorGoals.js
│   │   ├── MentorReports.js
│   │   ├── ScheduleMeeting.js
│   │   ├── AddNotes.js
│   │   └── StudentDetail.js
│   ├── services/
│   │   └── api.js        # API client with all endpoints
│   ├── styles/           # CSS modules
│   │   ├── Auth.css
│   │   ├── Dashboard.css
│   │   ├── Meetings.css
│   │   ├── Goals.css
│   │   ├── Reports.css
│   │   ├── Admin.css
│   │   ├── Home.css
│   │   ├── Form.css
│   │   └── MenteeList.css
│   ├── App.js            # Main app component with routes
│   ├── App.css
│   ├── index.js          # Entry point
│   └── index.css         # Global styles
└── package.json
```

## Navigation Routes

### Public Routes
- `/` - Home page
- `/login` - Login page

### Protected Routes
- `/admin-dashboard` - Admin panel
- `/mentor-dashboard` - Mentor dashboard
- `/mentor-mentees` - View mentees list
- `/mentor-meetings` - Manage meetings
- `/mentor-goals` - View and manage goals
- `/mentor-reports` - View reports
- `/mentor-schedule-meeting/:student_id` - Schedule meeting form
- `/mentor-add-note/:meeting_id` - Add meeting notes

## Key Components

### Services (api.js)
Central API client with methods for:
- Authentication (login, register)
- Mentor operations (get mentees, profile)
- Meetings (create, update, list)
- Goals (create, update, list)
- Notes (add, get, update)
- Interventions (create, list, update)
- Admin functions (assignments, users)
- Reports (analytics, statistics)

### Pages

**Login.js**
- Email/password authentication
- Demo credentials display
- Role-based redirection

**MentorDashboard.js**
- Welcome message
- Key metrics (mentees, meetings, goals)
- Quick action buttons
- Dashboard statistics

**MentorMentees.js**
- List of assigned mentees
- Student details cards
- Quick action buttons for each student

**MentorMeetings.js**
- Upcoming meetings tab
- Overdue meetings tab
- Meeting status updates
- Add notes option

**MentorGoals.js**
- Filter by status
- Goal cards with priority
- Status updates
- Edit/delete options

**MentorReports.js**
- Summary statistics
- Upcoming meetings table
- Overdue meetings list
- At-risk students details

**AdminDashboard.js**
- Student list
- Mentor list
- Assignment management
- Create new assignments

## Authentication

Token stored in localStorage:
```javascript
localStorage.getItem('token')
localStorage.getItem('user')
```

All API calls automatically include token in Authorization header.

## Styling

- Global styles in `index.css`
- Component-specific styles in `styles/` folder
- CSS Grid and Flexbox for layout
- Responsive design for mobile
- Color scheme: Blue (#667eea) and dark gray (#2c3e50)

## Demo Credentials

```
Admin: admin@mentorship.com / admin123
Mentor: mentor1@college.com / mentor123
Student: student1@college.com / student123
```

## Building for Production

```bash
npm run build
```

Creates optimized build in `build/` folder.

## Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

## Environment Configuration

API base URL is configured in `src/services/api.js`:
```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

Change this if backend runs on different port/host.

## Key Features Implemented

✅ User authentication with JWT
✅ Role-based access control (admin, mentor, student)
✅ Mentor-mentee assignment viewing
✅ Meeting scheduling and tracking
✅ Goal management with status updates
✅ Notes and feedback system
✅ Intervention tracking
✅ Reports and analytics
✅ Responsive UI design
✅ Error handling and validation
✅ Protected routes

## Troubleshooting

### White screen after login
- Check browser console for errors
- Verify backend is running
- Check token in localStorage

### API calls failing
- Ensure backend is running on port 5000
- Check API_BASE_URL in services/api.js
- Verify CORS is enabled on backend

### Styling issues
- Clear browser cache (Ctrl+Shift+Delete)
- Restart development server
- Check CSS file syntax

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Tips

- Use React Developer Tools for profiling
- Check Network tab for API response times
- Optimize images and assets
- Use code splitting for large pages

## Code Structure Best Practices

- Functional components with hooks
- Separate API calls in services
- Component-specific styles
- Error handling in try-catch blocks
- Loading states for async operations

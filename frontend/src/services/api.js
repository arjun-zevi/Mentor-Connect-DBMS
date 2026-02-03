import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth API
export const authAPI = {
    login: (email, password) => api.post('/auth/login', { email, password }),
    registerStudent: (data) => api.post('/auth/register-student', data),
    registerMentor: (data) => api.post('/auth/register-mentor', data),
};

// Mentor API
export const mentorAPI = {
    getMentees: () => api.get('/mentors/mentees'),
    getProfile: () => api.get('/mentors/profile'),
    updateProfile: (data) => api.put('/mentors/profile', data),
    getAllStudents: () => api.get('/mentors/students/all'),
    assignMentee: (data) => api.post('/mentors/assign', data),
};

// Parent API
export const parentAPI = {
    getChildren: () => api.get('/parents/children'),
    getProfile: () => api.get('/parents/profile'),
};

// Meeting API
export const meetingAPI = {
    createMeeting: (data) => api.post('/meetings', data),
    getUpcomingMeetings: () => api.get('/meetings/upcoming'),
    getStudentUpcoming: () => api.get('/meetings/student/upcoming'),
    getMyMeetings: () => api.get('/meetings/student/me'),
    getStudentMeetings: (student_id) => api.get(`/meetings/student/${student_id}`),
    updateMeeting: (meeting_id, data) => api.put(`/meetings/${meeting_id}`, data),
    getOverdueMeetings: () => api.get('/meetings/overdue/list'),
};

// Goal API
export const goalAPI = {
    createGoal: (data) => api.post('/goals', data),
    getStudentGoals: (student_id) => api.get(`/goals/student/${student_id}`),
    getMyGoals: () => api.get('/goals/student/me'),
    updateGoal: (goal_id, data) => api.put(`/goals/${goal_id}`, data),
    markGoal: (goal_id, data) => api.put(`/goals/${goal_id}/mark`, data),
    getActiveGoals: () => api.get('/goals/active/all'),
    getAllGoals: () => api.get('/goals/all'),
    deleteGoal: (goal_id) => api.delete(`/goals/${goal_id}`),
};

// Notes API
export const notesAPI = {
    addMeetingNote: (data) => api.post('/notes', data),
    getMeetingNotes: (meeting_id) => api.get(`/notes/meeting/${meeting_id}`),
    getMeetingNotesForStudent: (student_id) => api.get(`/notes/meeting/student/${student_id}`),
    addGeneralNote: (data) => api.post('/notes/general/add', data),
    getGeneralNotes: (student_id) => api.get(`/notes/general/student/${student_id}`),
    updateGeneralNote: (note_id, data) => api.put(`/notes/general/${note_id}`, data),
};

// Intervention API
export const interventionAPI = {
    createIntervention: (data) => api.post('/interventions', data),
    getStudentInterventions: (student_id) => api.get(`/interventions/student/${student_id}`),
    updateIntervention: (intervention_id, data) => api.put(`/interventions/${intervention_id}`, data),
    getActiveInterventions: () => api.get('/interventions/active/all'),
};

// Admin API
export const adminAPI = {
    getAllStudents: () => api.get('/admin/all'),
    getAllMentors: () => api.get('/admin/mentors/all'),
    assignMentor: (data) => api.post('/admin/assign', data),
    getAllAssignments: () => api.get('/admin/assignments/all'),
    updateAssignment: (assignment_id, data) => api.put(`/admin/assign/${assignment_id}`, data),
    deleteMentor: (mentor_id) => api.delete(`/admin/mentors/${mentor_id}`),
    deleteStudent: (student_id) => api.delete(`/admin/students/${student_id}`),
};

// Reports API
export const reportsAPI = {
    getUpcomingMeetings: () => api.get('/reports/upcoming-meetings'),
    getOverdueMeetings: () => api.get('/reports/overdue-meetings'),
    getAtRiskStudents: () => api.get('/reports/at-risk-students'),
    getMenteeCount: () => api.get('/reports/mentee-count'),
    getDashboardStats: () => api.get('/reports/dashboard-stats'),
};

export default api;

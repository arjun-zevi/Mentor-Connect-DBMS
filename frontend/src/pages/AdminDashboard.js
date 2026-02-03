import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI, mentorAPI, authAPI } from '../services/api';
import '../styles/Admin.css';

function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('assignments');
    const [students, setStudents] = useState([]);
    const [mentors, setMentors] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newAssignment, setNewAssignment] = useState({ mentor_id: '', student_id: '', start_date: '', end_date: '' });
    const [newMentor, setNewMentor] = useState({ email: '', password: '', name: '', department: '', availability: '' });
    const [newStudent, setNewStudent] = useState({ email: '', password: '', name: '', roll_number: '', phone: '', program: '', year: '', parent_name: '', parent_email: '', parent_password: '', parent_phone: '', parent_relation: '' });
    const navigate = useNavigate();

    useEffect(() => {
        loadAdminData();
    }, []);

    const loadAdminData = async () => {
        try {
            const [studentsRes, mentorsRes, assignmentsRes] = await Promise.all([
                adminAPI.getAllStudents(),
                adminAPI.getAllMentors(),
                adminAPI.getAllAssignments(),
            ]);
            setStudents(studentsRes.data);
            setMentors(mentorsRes.data);
            setAssignments(assignmentsRes.data);
        } catch (error) {
            console.error('Error loading admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAssignMentor = async (e) => {
        e.preventDefault();
        if (!newAssignment.mentor_id || !newAssignment.student_id || !newAssignment.start_date) {
            alert('Please fill all required fields');
            return;
        }
        try {
            await adminAPI.assignMentor(newAssignment);
            alert('Assignment created successfully');
            setNewAssignment({ mentor_id: '', student_id: '', start_date: '', end_date: '' });
            loadAdminData();
        } catch (error) {
            console.error('Error creating assignment:', error);
            alert(error.response?.data?.message || 'Failed to create assignment');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="dashboard">
            <nav className="navbar">
                <div className="navbar-brand">Admin Dashboard - Mentorship System</div>
                <div className="navbar-menu">
                    <a href="/admin-dashboard" className="nav-link">Dashboard</a>
                    <button onClick={handleLogout} className="btn btn-logout">Logout</button>
                </div>
            </nav>

            <div className="admin-container">
                <h1>Admin Dashboard</h1>

                <div className="admin-stats">
                    <div className="stat-card">
                        <h3>{students.length}</h3>
                        <p>Total Students</p>
                    </div>
                    <div className="stat-card">
                        <h3>{mentors.length}</h3>
                        <p>Total Mentors</p>
                    </div>
                    <div className="stat-card">
                        <h3>{assignments.length}</h3>
                        <p>Total Assignments</p>
                    </div>
                </div>

                <div className="tabs">
                    <button 
                        className={`tab ${activeTab === 'assignments' ? 'active' : ''}`}
                        onClick={() => setActiveTab('assignments')}
                    >
                        Assignments
                    </button>
                    <button 
                        className={`tab ${activeTab === 'students' ? 'active' : ''}`}
                        onClick={() => setActiveTab('students')}
                    >
                        Students
                    </button>
                    <button 
                        className={`tab ${activeTab === 'mentors' ? 'active' : ''}`}
                        onClick={() => setActiveTab('mentors')}
                    >
                        Mentors
                    </button>
                </div>

                {activeTab === 'assignments' && (
                        <div className="tab-content">
                        <h2>Create Mentor / Student</h2>

                        <div className="create-forms">
                            <div className="assign-form">
                            <h3>Add Mentor (creates user + mentor profile)</h3>
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                try {
                                    await authAPI.registerMentor(newMentor);
                                    alert('Mentor created');
                                    setNewMentor({ email: '', password: '', name: '', department: '', availability: '' });
                                    loadAdminData();
                                } catch (err) {
                                    console.error('Error creating mentor:', err);
                                    alert(err.response?.data?.message || 'Failed to create mentor');
                                }
                            }}>
                                <div className="form-group">
                                    <label>Email *</label>
                                    <input type="email" value={newMentor.email} onChange={(e) => setNewMentor({...newMentor, email: e.target.value})} required />
                                </div>
                                <div className="form-group">
                                    <label>Password *</label>
                                    <input type="password" value={newMentor.password} onChange={(e) => setNewMentor({...newMentor, password: e.target.value})} required />
                                </div>
                                <div className="form-group">
                                    <label>Name *</label>
                                    <input value={newMentor.name} onChange={(e) => setNewMentor({...newMentor, name: e.target.value})} required />
                                </div>
                                <div className="form-group">
                                    <label>Department</label>
                                    <input value={newMentor.department} onChange={(e) => setNewMentor({...newMentor, department: e.target.value})} />
                                </div>
                                <div className="form-group">
                                    <label>Availability</label>
                                    <input value={newMentor.availability} onChange={(e) => setNewMentor({...newMentor, availability: e.target.value})} />
                                </div>
                                <button type="submit" className="btn btn-primary">Create Mentor</button>
                            </form>
                        </div>

                        <div className="assign-form">
                            <h3>Add Student (creates user + student profile)</h3>
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                try {
                                    await authAPI.registerStudent(newStudent);
                                    alert('Student created');
                                    setNewStudent({ email: '', password: '', name: '', roll_number: '', phone: '', program: '', year: '' });
                                    loadAdminData();
                                } catch (err) {
                                    console.error('Error creating student:', err);
                                    alert(err.response?.data?.message || 'Failed to create student');
                                }
                            }}>
                                <div className="form-group">
                                    <label>Email *</label>
                                    <input type="email" value={newStudent.email} onChange={(e) => setNewStudent({...newStudent, email: e.target.value})} required />
                                </div>
                                <div className="form-group">
                                    <label>Password *</label>
                                    <input type="password" value={newStudent.password} onChange={(e) => setNewStudent({...newStudent, password: e.target.value})} required />
                                </div>
                                <div className="form-group">
                                    <label>Name *</label>
                                    <input value={newStudent.name} onChange={(e) => setNewStudent({...newStudent, name: e.target.value})} required />
                                </div>
                                <div className="form-group">
                                    <label>Roll Number *</label>
                                    <input value={newStudent.roll_number} onChange={(e) => setNewStudent({...newStudent, roll_number: e.target.value})} required />
                                </div>
                                <div className="form-group">
                                    <label>Phone</label>
                                    <input value={newStudent.phone} onChange={(e) => setNewStudent({...newStudent, phone: e.target.value})} />
                                </div>
                                <div className="form-group">
                                    <label>Program</label>
                                    <input value={newStudent.program} onChange={(e) => setNewStudent({...newStudent, program: e.target.value})} />
                                </div>
                                <div className="form-group">
                                    <label>Year</label>
                                    <input type="number" value={newStudent.year} onChange={(e) => setNewStudent({...newStudent, year: e.target.value})} />
                                </div>
                                <div className="parent-section">
                                    <h4>Parent (optional)</h4>
                                    <div className="form-group">
                                        <label>Parent Name</label>
                                        <input value={newStudent.parent_name || ''} onChange={(e) => setNewStudent({...newStudent, parent_name: e.target.value})} />
                                    </div>
                                    <div className="form-group">
                                        <label>Parent Email</label>
                                        <input type="email" value={newStudent.parent_email || ''} onChange={(e) => setNewStudent({...newStudent, parent_email: e.target.value})} />
                                    </div>
                                    <div className="form-group">
                                        <label>Parent Password</label>
                                        <input type="password" value={newStudent.parent_password || ''} onChange={(e) => setNewStudent({...newStudent, parent_password: e.target.value})} />
                                    </div>
                                    <div className="form-group">
                                        <label>Parent Phone</label>
                                        <input value={newStudent.parent_phone || ''} onChange={(e) => setNewStudent({...newStudent, parent_phone: e.target.value})} />
                                    </div>
                                    <div className="form-group">
                                        <label>Relation</label>
                                        <input value={newStudent.parent_relation || ''} onChange={(e) => setNewStudent({...newStudent, parent_relation: e.target.value})} />
                                    </div>
                                </div>
                                <button type="submit" className="btn btn-primary">Create Student</button>
                            </form>
                            </div>
                        </div>

                        {/* Assignments table removed per request - assignments are managed by mentors */}
                    </div>
                )}

                {activeTab === 'students' && (
                    <div className="tab-content">
                        <h2>Student List</h2>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Roll Number</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Program</th>
                                    <th>Year</th>
                                    <th>Academic Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map(s => (
                                    <tr key={s.student_id}>
                                        <td>{s.name}</td>
                                        <td>{s.roll_number}</td>
                                        <td>{s.email}</td>
                                        <td>{s.phone || 'N/A'}</td>
                                        <td>{s.program}</td>
                                        <td>{s.year}</td>
                                        <td>{s.academic_status}</td>
                                        <td>
                                            <button className="btn btn-danger" onClick={async () => {
                                                if (!window.confirm(`Delete student ${s.name}? This will remove their user account.`)) return;
                                                try {
                                                    await adminAPI.deleteStudent(s.student_id);
                                                    alert('Student deleted');
                                                    loadAdminData();
                                                } catch (err) {
                                                    console.error('Error deleting student:', err);
                                                    alert(err.response?.data?.message || 'Failed to delete student');
                                                }
                                            }}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'mentors' && (
                    <div className="tab-content">
                        <h2>Mentor List</h2>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Department</th>
                                    <th>Availability</th>
                                    <th>Mentees Count</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mentors.map(m => (
                                    <tr key={m.mentor_id}>
                                        <td>{m.name}</td>
                                        <td>{m.email}</td>
                                        <td>{m.department}</td>
                                        <td>{m.availability || 'N/A'}</td>
                                        <td>{m.mentee_count}</td>
                                        <td>
                                            <button className="btn btn-danger" onClick={async () => {
                                                if (!window.confirm(`Delete mentor ${m.name}? This will remove their user account.`)) return;
                                                try {
                                                    await adminAPI.deleteMentor(m.mentor_id);
                                                    alert('Mentor deleted');
                                                    loadAdminData();
                                                } catch (err) {
                                                    console.error('Error deleting mentor:', err);
                                                    alert(err.response?.data?.message || 'Failed to delete mentor');
                                                }
                                            }}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminDashboard;

const http = require('http');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your_jwt_secret_key';
// Using Abhay (mentor_id 3) from DB
const payload = { user_id: 10, email: 'Abhay@gmail.com', role: 'mentor', mentor_id: 3 };
const token = jwt.sign(payload, JWT_SECRET);

const data = JSON.stringify({
  assignment_id: 5,
  student_id: 5,
  meeting_date: '2025-11-28',
  meeting_time: '09:05:00',
  duration: 20,
  mode: 'offline',
  location: 'college'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/meetings',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
    'Authorization': `Bearer ${token}`
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', body);
  });
});

req.on('error', (err) => {
  console.error('Request error:', err);
  if (err.code) console.error('Error code:', err.code);
});

req.write(data);
req.end();

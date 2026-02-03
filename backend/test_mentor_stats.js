const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your_jwt_secret_key';

// Mentor Abhay (mentor_id 3)
const mentorPayload = {
    user_id: 10,
    email: 'Abhay@gmail.com',
    role: 'mentor',
    mentor_id: 3,
    name: 'Abhay'
};

const mentorToken = jwt.sign(mentorPayload, JWT_SECRET);
console.log('=== Mentor Token (Abhay) ===');
console.log(mentorToken);

// Test stats endpoint
const http = require('http');
const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/reports/dashboard-stats',
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${mentorToken}`
    }
};

const req = http.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log('\n=== Dashboard Stats Response ===');
        console.log('Status:', res.statusCode);
        try {
            console.log(JSON.stringify(JSON.parse(data), null, 2));
        } catch (e) {
            console.log('Raw:', data);
        }
        process.exit(0);
    });
});

req.on('error', (e) => {
    console.error('Request error:', e);
    process.exit(1);
});

req.end();

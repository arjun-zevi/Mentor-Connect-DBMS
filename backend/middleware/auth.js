const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your_jwt_secret_key';

const verifyToken = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token', error: error.message });
    }
};

const verifyMentor = (req, res, next) => {
    if (req.user.role !== 'mentor') {
        return res.status(403).json({ message: 'Access denied. Mentor access required.' });
    }
    next();
};

const verifyAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin access required.' });
    }
    next();
};

const verifyStudent = (req, res, next) => {
    if (req.user.role !== 'student') {
        return res.status(403).json({ message: 'Access denied. Student access required.' });
    }
    next();
};

const verifyParent = (req, res, next) => {
    if (req.user.role !== 'parent') {
        return res.status(403).json({ message: 'Access denied. Parent access required.' });
    }
    next();
};

module.exports = { verifyToken, verifyMentor, verifyAdmin, verifyStudent, verifyParent };

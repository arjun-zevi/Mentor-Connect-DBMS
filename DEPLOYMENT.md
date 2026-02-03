# DEPLOYMENT & PRODUCTION GUIDE

## Local Development (Already Configured)

The application is ready to run locally:

```bash
# Terminal 1: Backend
cd backend
npm install
npm start

# Terminal 2: Frontend
cd frontend
npm install
npm start
```

---

## Production Deployment

### Option 1: Deploy on Windows Server

**Backend (Node.js):**

1. **Install Node.js on server**
   - Download from nodejs.org

2. **Upload backend folder**
   ```bash
   # Copy entire backend folder to server
   ```

3. **Install dependencies:**
   ```bash
   cd backend
   npm install --production
   ```

4. **Configure .env for production:**
   ```
   PORT=5000
   DB_HOST=your-mysql-host
   DB_USER=prod_user
   DB_PASSWORD=strong_password
   DB_NAME=mentorship_db
   NODE_ENV=production
   ```

5. **Use PM2 to keep server running:**
   ```bash
   npm install -g pm2
   pm2 start server.js --name "mentorship-api"
   pm2 startup
   pm2 save
   ```

**Frontend (React Build):**

1. **Build for production:**
   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. **Deploy build folder**
   - Upload `build/` folder to web server (Apache/Nginx)
   - Or serve with Node.js static server

3. **Update API URL** in production:
   - Change `API_BASE_URL` in `frontend/src/services/api.js`
   - Or use environment variables

### Option 2: Deploy on AWS

**RDS MySQL Database:**
1. Create RDS instance
2. Run schema.sql on RDS
3. Update .env with RDS endpoint

**EC2 for Backend:**
1. Launch EC2 instance
2. Install Node.js
3. Deploy backend code
4. Use PM2 for process management
5. Configure security groups (port 5000)

**S3 + CloudFront for Frontend:**
1. Build React app
2. Upload build folder to S3
3. Create CloudFront distribution
4. Point domain to CloudFront

### Option 3: Deploy on Heroku

**Backend:**
```bash
# Create Heroku app
heroku create mentorship-api

# Add MySQL database (ClearDB or JawsDB)
heroku addons:create cleardb:ignite

# Set environment variables
heroku config:set DB_HOST=xxx DB_USER=xxx DB_PASSWORD=xxx

# Deploy
git push heroku main
```

**Frontend:**
```bash
# Deploy build folder to Netlify or Vercel
# Or use Heroku buildpacks for static sites
```

---

## Docker Deployment (Recommended)

### Docker Setup

**Backend Dockerfile:**
```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

**Docker Compose:**
```yaml
version: '3'
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_DATABASE: mentorship_db
      MYSQL_ROOT_PASSWORD: root
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./database/schema.sql:/docker-entrypoint-initdb.d/schema.sql

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      DB_HOST: mysql
      DB_USER: root
      DB_PASSWORD: root
      DB_NAME: mentorship_db
    depends_on:
      - mysql

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      REACT_APP_API_URL: http://localhost:5000/api

volumes:
  mysql_data:
```

**Run with Docker:**
```bash
docker-compose up
```

---

## Security Checklist

- [ ] Change JWT_SECRET in production
- [ ] Use strong database passwords
- [ ] Enable HTTPS/SSL certificates
- [ ] Set CORS to specific domains
- [ ] Use environment variables for secrets
- [ ] Implement rate limiting
- [ ] Add input validation
- [ ] Enable database backups
- [ ] Configure firewall rules
- [ ] Use password hashing (bcryptjs - already done)
- [ ] Add request logging
- [ ] Enable CSRF protection

### Updated Security Config:

**Backend server.js (add to top):**
```javascript
// Security headers
app.use(require('helmet')());

// Rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

// CORS - Specific domains only
app.use(cors({
  origin: ['http://localhost:3000', 'https://yourdomain.com'],
  credentials: true
}));
```

---

## Database Backup & Recovery

### Backup Database:
```bash
# Backup
mysqldump -u root -p mentorship_db > backup.sql

# Scheduled backup (cron job)
0 2 * * * mysqldump -u root -p mentorship_db > /backups/backup_$(date +\%Y\%m\%d).sql
```

### Restore Database:
```bash
mysql -u root -p mentorship_db < backup.sql
```

---

## Performance Optimization

### Frontend Optimization:
1. **Code Splitting:**
   ```javascript
   const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
   ```

2. **Image Optimization:**
   - Use WebP format
   - Compress images

3. **Caching:**
   - Enable browser caching
   - Use service workers

### Backend Optimization:
1. **Database Indexing:**
   - Already added indexes in schema.sql
   - Monitor slow queries

2. **Caching:**
   ```javascript
   const redis = require('redis');
   const client = redis.createClient();
   ```

3. **Database Connection Pooling:**
   - Already configured in database.js

4. **API Pagination:**
   ```javascript
   GET /api/mentors/mentees?page=1&limit=10
   ```

---

## Monitoring & Logging

### Backend Logging:
```javascript
const winston = require('winston');
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### Application Monitoring:
- Use Datadog or New Relic
- Monitor API response times
- Track error rates
- Monitor database performance

### Database Monitoring:
- Monitor slow queries
- Check connection pool usage
- Monitor disk space
- Review error logs

---

## Scaling Strategy

### For High Traffic:

1. **Database:**
   - Use read replicas
   - Implement caching layer (Redis)
   - Database sharding if needed

2. **Backend:**
   - Use load balancer (Nginx)
   - Deploy multiple instances
   - Use message queue for async tasks

3. **Frontend:**
   - Use CDN for static files
   - Implement lazy loading
   - Optimize bundle size

---

## SSL/HTTPS Setup

### Using Let's Encrypt (Free):
```bash
# Install certbot
sudo apt-get install certbot

# Generate certificate
sudo certbot certonly --standalone -d yourdomain.com

# Configure in Node.js
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/yourdomain.com/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/yourdomain.com/fullchain.pem')
};

https.createServer(options, app).listen(443);
```

---

## Maintenance & Updates

### Regular Tasks:
- [ ] Monitor error logs daily
- [ ] Backup database weekly
- [ ] Update dependencies monthly
- [ ] Review security patches
- [ ] Monitor disk space
- [ ] Check database performance

### Update Dependencies:
```bash
npm outdated
npm update
npm audit
npm audit fix
```

---

## Testing Before Production

### Backend Testing:
```bash
# Test API endpoints
npm test

# Load testing
npm install -g artillery
artillery quick --count 100 --num 10 http://localhost:5000/api/health
```

### Frontend Testing:
```bash
npm test
npm run build
```

### Database Testing:
```bash
# Verify all tables
SHOW TABLES;
SELECT COUNT(*) FROM users;

# Test complex queries
SELECT * FROM reports_view;
```

---

## Rollback Plan

If deployment fails:

1. **Backend Rollback:**
   ```bash
   pm2 stop mentorship-api
   git checkout previous-version
   npm install
   pm2 start server.js
   ```

2. **Database Rollback:**
   ```bash
   mysql -u root -p mentorship_db < backup.sql
   ```

3. **Frontend Rollback:**
   - Deploy previous build from S3/CDN
   - Use version control tags

---

## Monitoring URLs

After deployment, monitor these:
- `https://yourdomain.com/api/health` - API health check
- `https://yourdomain.com/` - Frontend
- Admin Dashboard - http://yourdomain.com/admin-dashboard
- Mentor Dashboard - http://yourdomain.com/mentor-dashboard

---

## Support & Troubleshooting

**Common Production Issues:**

1. **Database Connection Error:**
   - Check MySQL is running
   - Verify credentials in .env
   - Check firewall rules

2. **API Timeouts:**
   - Check database query performance
   - Increase pool size in database.js
   - Add caching layer

3. **High Memory Usage:**
   - Check for memory leaks
   - Implement pagination
   - Restart application

4. **Frontend Not Loading:**
   - Check API_BASE_URL
   - Verify CORS settings
   - Check network requests in console

---

## Cost Estimation (Monthly)

**AWS Deployment:**
- RDS MySQL: $15-50
- EC2 Instance: $10-50
- CDN/CloudFront: $1-20
- **Total: $25-120/month**

**Heroku Deployment:**
- Dyno (Backend): $7-50
- Heroku Postgres: $9-200
- Static hosting: Free-20
- **Total: $16-270/month**

**Self-Hosted (VPS):**
- Single VPS: $5-20/month
- MySQL Database: Included
- **Total: $5-20/month**

---

**Ready for Production Deployment!** 🚀

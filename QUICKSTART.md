# Quick Start Guide

## Initial Setup

### 1. Install MongoDB
Make sure MongoDB is installed and running on your system.
- Windows: Download from https://www.mongodb.com/try/download/community
- Mac: `brew install mongodb-community`
- Linux: Follow official MongoDB installation guide

### 2. Start MongoDB
```bash
# Windows (run as service)
net start MongoDB

# Mac/Linux
mongod
```

### 3. Install Dependencies

From the root directory:
```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..

# Install client dependencies
cd client
npm install
cd ..
```

Or use the shortcut:
```bash
npm run install-all
```

### 4. Configure Environment Variables

**Server (.env)**
```bash
cd server
cp .env.example .env
```

Edit `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/looms_management
JWT_SECRET=your_secret_key_change_this_in_production
JWT_EXPIRE=7d
NODE_ENV=development
DATA_RETENTION_YEARS=2
```

**Client (.env)**
Already created at `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 5. Create Initial User

Start the server first:
```bash
cd server
npm run dev
```

Then use a tool like Postman or curl to create the first user:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@looms.com",
    "password": "admin123",
    "role": "Owner",
    "phone": "1234567890"
  }'
```

### 6. Start the Application

**Option 1: Run both servers together (Recommended)**
```bash
# From root directory
npm run dev
```

**Option 2: Run servers separately**

Terminal 1 (Backend):
```bash
cd server
npm run dev
```

Terminal 2 (Frontend):
```bash
cd client
npm run dev
```

### 7. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
- API Health: http://localhost:5000/api/health

### 8. Login

Use the credentials you created:
- Email: admin@looms.com
- Password: admin123

## 🎉 You're Ready!

The application is now running. Explore the features:
1. **Dashboard** - View production analytics
2. **Machines** - Manage your looms
3. **Workers** - Manage workforce
4. **Takas** - Track production units
5. **Quality Types** - Define quality standards
6. **Production** - Record daily production
7. **Reports** - Generate detailed reports

## Common Issues

### MongoDB Connection Error
- Ensure MongoDB is running
- Check the `MONGODB_URI` in `.env`
- Try: `mongodb://127.0.0.1:27017/looms_management`

### Port Already in Use
- Backend port 5000 is used: Change `PORT` in `server/.env`
- Frontend port 5173 is used: Vite will automatically use the next available port

### Module Not Found
```bash
# Clear node_modules and reinstall
rm -rf node_modules server/node_modules client/node_modules
npm run install-all
```

### CORS Errors
- Ensure backend is running on port 5000
- Check `VITE_API_URL` in `client/.env`

## Development Tips

### Hot Reload
Both frontend and backend support hot reload:
- Backend: Uses nodemon
- Frontend: Uses Vite HMR

### API Testing
Use tools like:
- Postman
- Thunder Client (VS Code extension)
- curl

### Database Viewing
- MongoDB Compass (GUI)
- mongo shell (CLI)

### VS Code Extensions (Recommended)
- ESLint
- Prettier
- MongoDB for VS Code
- Thunder Client
- Tailwind CSS IntelliSense

## Next Steps

1. Explore the Dashboard
2. Add your first machine
3. Register workers
4. Create quality types
5. Define takas
6. Start recording production
7. Generate reports

## Need Help?

- Check the main README.md for detailed documentation
- Review API endpoints documentation
- Check server console for backend errors
- Check browser console for frontend errors

---

Happy managing! 🚀

# Looms Management System

A comprehensive MERN stack application for managing textile production operations, including machines, workers, production tracking, and detailed reporting.

## 🚀 Features

### Dashboard Analytics
- **Real-time Statistics**: View machine count, worker count, active takas, and daily production
- **Shift-based Metrics**: Compare day and night shift production
- **Monthly Trends**: Interactive charts showing production trends over 6 months
- **Top Performers**: Identify top-performing workers and machines
- **Quality Distribution**: Visualize production by quality type
- **Quick Actions**: Fast access to common operations

### Machines Management
- Complete CRUD operations (Create, Read, Update, Delete, Bulk Delete)
- Assign workers to day and night shifts
- Track machine status (Active, Inactive, Maintenance, Broken)
- View detailed production history with shift filtering
- Real-time active taka tracking
- Machine-specific quality type analysis

### Workers Management
- Manage permanent and temporary workers
- Dual worker types with different compensation models
- Shift-based assignments (Day/Night)
- Advanced filtering by name, code, type, and shift
- View machine assignment history
- Monthly performance analytics

### Taka Management
- Create and track production units (takas)
- Assign quality types with predefined rates
- Track taka status (Active/Completed/Cancelled)
- Automatic earnings calculation
- Production metrics for each taka
- Start/end date tracking

### Quality Types Management
- Define multiple quality types (Standard, Premium, Deluxe, etc.)
- Set specific rates per meter
- Automatic production value calculation
- Quality-based reporting

### Production Tracking
- Record daily production by machine, worker, and shift
- Automatic taka meter updates
- Earnings calculation based on quality rates
- Filter by date range, shift, machine, or worker

### Reports & Analysis
- **Worker Production Reports**: Daily, monthly, and custom date ranges
- **Machine Reports**: Production by machine with shift breakdown
- **Salary Reports**: Automatic salary calculation based on meters produced
- **PDF Export**: Generate PDF reports for all report types

### User Management (Owner Only)
- Role-based access control (Owner/Manager)
- Secure authentication with JWT
- User activity tracking
- Profile management

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **PDFKit** for PDF generation
- **date-fns** for date manipulation

### Frontend
- **React 19** with Hooks
- **Vite** for fast development
- **React Router** for navigation
- **Zustand** for state management
- **Axios** for API calls
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **React Icons** for icons
- **React Hot Toast** for notifications

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn

### Backend Setup

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/looms_management
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development
DATA_RETENTION_YEARS=2
```

5. Start the server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

### Full Stack Setup

From the root directory:

```bash
# Install all dependencies
npm run install-all

# Run both frontend and backend concurrently
npm run dev
```

## 🔐 Default Credentials

Create a user through the API or use these demo credentials:
- **Email**: admin@looms.com
- **Password**: admin123
- **Role**: Owner

## 📁 Project Structure

```
looms/
├── server/                 # Backend Node.js application
│   ├── config/            # Configuration files
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Custom middleware
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   └── index.js          # Server entry point
│
├── client/                # Frontend React application
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── store/        # Zustand state management
│   │   ├── utils/        # Utility functions
│   │   ├── App.jsx       # Main app component
│   │   └── main.jsx      # React entry point
│   └── public/           # Static assets
│
└── package.json          # Root package.json for scripts
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/update-password` - Update password

### Machines
- `GET /api/machines` - Get all machines
- `POST /api/machines` - Create machine
- `GET /api/machines/:id` - Get single machine
- `PUT /api/machines/:id` - Update machine
- `DELETE /api/machines/:id` - Delete machine
- `POST /api/machines/bulk-delete` - Bulk delete machines
- `PUT /api/machines/:id/assign-worker` - Assign worker
- `GET /api/machines/:id/production` - Get production history

### Workers
- `GET /api/workers` - Get all workers
- `POST /api/workers` - Create worker
- `GET /api/workers/:id` - Get single worker
- `PUT /api/workers/:id` - Update worker
- `DELETE /api/workers/:id` - Delete worker
- `GET /api/workers/:id/performance` - Get performance

### Takas
- `GET /api/takas` - Get all takas
- `POST /api/takas` - Create taka
- `GET /api/takas/:id` - Get single taka
- `PUT /api/takas/:id` - Update taka
- `DELETE /api/takas/:id` - Delete taka
- `PUT /api/takas/:id/complete` - Complete taka

### Quality Types
- `GET /api/qualities` - Get all quality types
- `POST /api/qualities` - Create quality type
- `GET /api/qualities/:id` - Get single quality type
- `PUT /api/qualities/:id` - Update quality type
- `DELETE /api/qualities/:id` - Delete quality type

### Productions
- `GET /api/productions` - Get all productions
- `POST /api/productions` - Create production
- `GET /api/productions/:id` - Get single production
- `PUT /api/productions/:id` - Update production
- `DELETE /api/productions/:id` - Delete production

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/monthly-trends` - Get monthly trends
- `GET /api/dashboard/top-performers` - Get top performers
- `GET /api/dashboard/quality-distribution` - Get quality distribution

### Reports
- `GET /api/reports/worker` - Get worker report
- `GET /api/reports/machine` - Get machine report
- `GET /api/reports/salary` - Get salary report
- `POST /api/reports/pdf` - Generate PDF report

### Users (Owner only)
- `GET /api/users` - Get all users
- `POST /api/users` - Create user
- `GET /api/users/:id` - Get single user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## 🎨 UI Components

- **Dashboard**: Analytics widgets with charts
- **Data Tables**: Sortable, filterable tables with pagination
- **Forms**: Comprehensive forms with validation
- **Modals**: Confirmation and input modals
- **Toast Notifications**: Success/error feedback
- **Responsive Design**: Mobile-first approach

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Protected API routes
- Role-based access control
- Input validation
- XSS protection

## 📊 Database Schema

### User
- name, email, password, role, phone, isActive, lastLogin

### Machine
- machineCode, machineName, status, dayShiftWorker, nightShiftWorker, currentTaka

### Worker
- workerCode, name, workerType, phone, shift, assignedMachines

### Taka
- takaNumber, machine, qualityType, totalMeters, status, ratePerMeter, earnings

### QualityType
- name, description, ratePerMeter

### Production
- date, machine, worker, taka, qualityType, shift, metersProduced, earnings

## 🚀 Deployment

### Backend Deployment (e.g., Heroku, Railway)
1. Set environment variables
2. Ensure MongoDB connection string is set
3. Build and deploy

### Frontend Deployment (e.g., Vercel, Netlify)
1. Update `VITE_API_URL` to production API URL
2. Build: `npm run build`
3. Deploy `dist` folder

## 📝 Future Enhancements

- [ ] Real-time notifications with WebSockets
- [ ] Advanced analytics with AI predictions
- [ ] Mobile app (React Native)
- [ ] Inventory management module
- [ ] Multi-language support
- [ ] Dark mode theme
- [ ] Export to Excel
- [ ] Automated backup system

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Your Name - [GitHub Profile](https://github.com/yourusername)

## 🙏 Acknowledgments

- React team for the amazing framework
- MongoDB team for the database
- All open-source contributors

---

**Made with ❤️ for the textile industry**

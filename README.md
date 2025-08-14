# TrackIt - Financial Tracking Application

A modern, full-stack financial tracking application built with React, Node.js, Express, and MongoDB.

## 🚀 Features

- **User Authentication**: Secure login/register with JWT tokens
- **Transaction Management**: Add, edit, delete, and categorize transactions
- **Financial Analytics**: Dashboard with income/expense statistics
- **Responsive Design**: Modern UI that works on all devices
- **Real-time Updates**: Instant feedback and data synchronization
- **Security**: Rate limiting, input validation, and secure authentication

## 🏗️ Project Structure

```
trackit/
├── backend/                 # Node.js/Express API server
│   ├── controllers/         # Request handlers
│   ├── middleware/          # Custom middleware
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API route definitions
│   ├── logs/               # Application logs
│   └── server.js           # Main server file
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── utils/          # Utility functions
│   │   └── App.js          # Main app component
│   └── public/             # Static assets
└── package.json            # Root package configuration
```

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Winston** - Logging
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing

### Frontend
- **React** - UI library
- **React Router** - Client-side routing
- **React Toastify** - Notifications
- **CSS3** - Styling with custom design system

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd trackit
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Environment Configuration**
   
   Create `.env` file in the `backend/` directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/trackit
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=24h
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start the application**
   ```bash
   # Development mode (both frontend and backend)
   npm run dev
   
   # Or start individually
   npm run dev:backend  # Backend only
   npm run dev:frontend # Frontend only
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Health Check: http://localhost:5000/health

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

### Transactions
- `GET /api/transactions` - Get paginated transactions
- `POST /api/transactions` - Create new transaction
- `GET /api/transactions/:id` - Get specific transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `GET /api/transactions/stats` - Get transaction statistics
- `GET /api/transactions/categories` - Get category statistics

## 🎨 UI Components

### Core Components
- **LoginForm** - User authentication
- **RegisterForm** - User registration
- **TransactionForm** - Add/edit transactions
- **Dashboard** - Financial overview
- **Transactions** - Transaction list and management
- **Profile** - User profile management

### Design System
- Modern, clean interface
- Responsive design for all screen sizes
- Consistent color scheme and typography
- Smooth animations and transitions
- Accessible form controls

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt for password security
- **Input Validation** - Comprehensive request validation
- **Rate Limiting** - Protection against brute force attacks
- **CORS Configuration** - Controlled cross-origin requests
- **Security Headers** - Helmet for additional security
- **Error Handling** - Secure error responses

## 📊 Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  isActive: Boolean,
  lastLogin: Date,
  // ... additional fields
}
```

### Transaction Model
```javascript
{
  userId: ObjectId (ref: User),
  type: String (enum: ['income', 'expense']),
  amount: Number,
  category: String,
  description: String,
  date: Date,
  tags: [String],
  isRecurring: Boolean,
  // ... additional fields
}
```

## 🚀 Deployment

### Backend Deployment
1. Set environment variables for production
2. Configure MongoDB connection
3. Set up proper logging
4. Configure CORS for production domain
5. Deploy to your preferred platform (Heroku, AWS, etc.)

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy the `build/` folder to your hosting service
3. Configure environment variables for API endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue in the repository.

---

**TrackIt** - Your Financial Journey Starts Here 💰 
# TrackIt Backend API

A robust and secure backend API for the TrackIt financial tracking application, built with Node.js, Express, and MongoDB.

## 🚀 Features

### Authentication & Authorization
- **User Registration & Login** with JWT tokens
- **Refresh Token System** for secure token management
- **Password Reset** functionality with secure token generation
- **Profile Management** - update user information and change passwords
- **Secure Logout** with proper token handling
- **Role-based Access Control** (ready for future expansion)

### Transaction Management
- **CRUD Operations** for financial transactions
- **Advanced Filtering** by type, category, date range, amount range
- **Search Functionality** across description, category, and tags
- **Pagination** for large datasets
- **Sorting** by multiple fields
- **Bulk Operations** for managing multiple transactions
- **Recurring Transactions** support

### Security Features
- **Rate Limiting** to prevent brute force attacks
- **Input Validation** with comprehensive sanitization
- **Helmet.js** for security headers
- **CORS Configuration** with origin restrictions
- **JWT Token Security** with configurable expiration
- **Password Hashing** with bcrypt (12 salt rounds)
- **Request Logging** for audit trails

### Performance & Monitoring
- **Database Indexing** for optimal query performance
- **Request Logging** with Winston
- **Error Handling** with centralized error management
- **Health Check Endpoints** for monitoring
- **Graceful Shutdown** handling
- **Response Caching** ready for implementation

## 📁 Project Structure

```
backend/
├── controllers/          # Business logic
│   ├── authController.js
│   └── transactionController.js
├── middleware/           # Custom middleware
│   ├── authMiddleware.js
│   ├── validationMiddleware.js
│   ├── rateLimitMiddleware.js
│   ├── errorMiddleware.js
│   └── loggingMiddleware.js
├── models/              # Database schemas
│   ├── User.js
│   └── Transaction.js
├── routes/              # API route definitions
│   ├── authRoutes.js
│   └── transactionRoutes.js
├── logs/                # Application logs (auto-created)
├── server.js            # Main application file
├── package.json         # Dependencies and scripts
└── README.md           # This file
```

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd trackit/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the backend directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/trackit
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_REFRESH_SECRET=your-refresh-token-secret
   JWT_EXPIRES_IN=24h
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 🔐 API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | User registration | No |
| POST | `/login` | User login | No |
| POST | `/refresh-token` | Refresh JWT token | No |
| POST | `/logout` | User logout | Yes |
| GET | `/profile` | Get user profile | Yes |
| PUT | `/profile` | Update user profile | Yes |
| PUT | `/change-password` | Change password | Yes |
| POST | `/forgot-password` | Request password reset | No |
| POST | `/reset-password` | Reset password with token | No |

### Transaction Routes (`/api/transactions`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/` | Create transaction | Yes |
| GET | `/` | Get transactions (with filtering) | Yes |
| GET | `/stats` | Get transaction statistics | Yes |
| GET | `/categories` | Get category breakdown | Yes |
| GET | `/:id` | Get specific transaction | Yes |
| PUT | `/:id` | Update transaction | Yes |
| DELETE | `/:id` | Delete transaction | Yes |
| DELETE | `/bulk` | Bulk delete transactions | Yes |

## 🔍 Query Parameters

### Transaction Filtering
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `type` - Transaction type (income/expense)
- `category` - Category filter (case-insensitive)
- `startDate` - Start date for date range
- `endDate` - End date for date range
- `minAmount` - Minimum amount filter
- `maxAmount` - Maximum amount filter
- `search` - Text search across description, category, tags
- `sortBy` - Field to sort by (default: date)
- `sortOrder` - Sort order (asc/desc, default: desc)

### Statistics Periods
- `period` - Time period for stats (today, week, month, year, all)

## 📊 Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "pagination": { ... } // For paginated responses
}
```

Error responses:
```json
{
  "success": false,
  "error": "Error message",
  "details": { ... } // Additional error details
}
```

## 🚨 Rate Limiting

- **Authentication Routes**: 5 requests per 15 minutes
- **Transaction Creation**: 50 requests per 15 minutes
- **General API**: 100 requests per 15 minutes

## 🔒 Security Features

### Input Validation
- Email format validation
- Password strength requirements
- Amount validation (positive numbers only)
- String length limits
- Enum validation for transaction types

### Authentication Security
- JWT tokens with configurable expiration
- Refresh token system
- Secure password hashing (bcrypt)
- Rate limiting on auth endpoints
- Token blacklisting ready for implementation

### Data Protection
- User data isolation (users can only access their own data)
- Input sanitization
- SQL injection protection (MongoDB)
- XSS protection headers (Helmet.js)

## 📈 Performance Optimizations

### Database
- Compound indexes for common queries
- Efficient aggregation pipelines
- Connection pooling
- Query optimization

### API
- Pagination for large datasets
- Efficient filtering and sorting
- Response compression ready
- Caching layer ready for implementation

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

## 📝 Logging

The application uses Winston for structured logging:

- **Request Logging**: All incoming requests and responses
- **Error Logging**: Detailed error information with stack traces
- **Security Logging**: Authentication and security events
- **Performance Logging**: Request duration and performance metrics

Logs are stored in the `logs/` directory:
- `combined.log` - All log levels
- `error.log` - Error level logs only

## 🚀 Deployment

### Production Considerations
1. Set `NODE_ENV=production`
2. Use strong JWT secrets
3. Configure proper CORS origins
4. Set up monitoring and alerting
5. Implement proper logging aggregation
6. Use environment-specific MongoDB connections
7. Set up SSL/TLS termination

### Environment Variables
- `NODE_ENV` - Application environment
- `PORT` - Server port
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `JWT_REFRESH_SECRET` - Refresh token secret
- `JWT_EXPIRES_IN` - Token expiration time
- `FRONTEND_URL` - Frontend application URL

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

## 🔮 Future Enhancements

- [ ] Email verification system
- [ ] Two-factor authentication
- [ ] Advanced analytics and reporting
- [ ] Export functionality (CSV, PDF)
- [ ] Budget planning and tracking
- [ ] Recurring transaction automation
- [ ] Multi-currency support
- [ ] Receipt image upload and OCR
- [ ] Integration with banking APIs
- [ ] Mobile app API endpoints 
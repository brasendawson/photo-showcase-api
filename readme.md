# Photography Showcase API

A comprehensive REST API for managing a photography showcase platform with features including photo management, booking system, user authentication, and review system.

## 🚀 Features

- User authentication and authorization
- Photo upload and management
- Booking system for photography sessions
- Review and rating system
- Category management
- Role-based access control
- API documentation with Swagger
- Secure file uploads with Cloudinary
- Error logging and monitoring

## 🛠 Tech Stack

- **Runtime**: Node.js (v20.19.2)
- **Framework**: Express.js
- **Database**: MySQL with Sequelize ORM
- **Authentication**: JWT
- **File Storage**: Cloudinary
- **Documentation**: Swagger/OpenAPI 3.0
- **Logging**: Winston

## 📦 Dependencies

```json
{
  "dependencies": {
    "bcrypt": "^5.1.0",
    "cloudinary": "^1.37.0",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "express": "^4.18.2",
    "express-rate-limit": "^6.7.0",
    "jsonwebtoken": "^9.0.0",
    "multer": "^1.4.5-lts.1",
    "mysql2": "^3.3.1",
    "sequelize": "^6.31.1",
    "swagger-jsdoc": "^6.2.8",
    "swagger-ui-express": "^4.6.3",
    "winston": "^3.8.2"
  }
}
```

## 🔐 User Roles & Permissions

### 👤 User
- View photos and categories
- Create and manage bookings
- Write/edit/delete own reviews
- Update own profile

### 📸 Photographer
- All User permissions
- Upload and manage own photos
- Manage received bookings
- View booking statistics

### 👑 Admin
- All Photographer permissions
- Manage all photos
- Manage categories
- Moderate reviews
- User management

## 🔗 API Endpoints

### 🔑 Authentication
```http
POST /api/auth/register
Content-Type: application/json

{
    "username": "string",
    "email": "string",
    "password": "string",
    "role": "user|photographer"
}

POST /api/auth/login
{
    "email": "string",
    "password": "string"
}

POST /api/auth/logout (Protected)
Authorization: Bearer <token>
```

### 📷 Photos
```http
POST /api/photos (Protected - Photographer/Admin)
Content-Type: multipart/form-data
- photo: File
- title: string
- description: string
- category: string

GET /api/photos (Public)
GET /api/photos/:id (Public)
PUT /api/photos/:id (Protected - Owner/Admin)
DELETE /api/photos/:id (Protected - Owner/Admin)
GET /api/photos/category/:category (Public)
```

### 📑 Categories
```http
POST /api/categories (Protected - Admin)
{
    "name": "string",
    "description": "string"
}

GET /api/categories (Public)
PUT /api/categories/:id (Protected - Admin)
DELETE /api/categories/:id (Protected - Admin)
```

### 📅 Bookings
```http
POST /api/bookings (Protected - User)
{
    "photographerId": "integer",
    "date": "datetime",
    "location": "string",
    "package": "string",
    "notes": "string"
}

GET /api/bookings (Protected - User)
GET /api/bookings/photographer/:id (Protected - Photographer)
PUT /api/bookings/:id (Protected - Owner)
DELETE /api/bookings/:id (Protected - Owner)
```

### ⭐ Reviews
```http
POST /api/reviews/:photoId (Protected - User)
{
    "rating": "integer(1-5)",
    "comment": "string"
}

GET /api/reviews/photo/:photoId (Public)
PUT /api/reviews/:id (Protected - Owner)
DELETE /api/reviews/:id (Protected - Owner/Admin)
```

## 🚀 Getting Started

1. **Clone the repository**
```bash
git clone <repository-url>
cd photo-showcase-api
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
Create a `.env` file in the root directory:
```env
NODE_ENV=development
PORT=3000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=photoshowapi
DB_USER=root
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

4. **Start the server**
```bash
npm start
```

5. **Access API documentation**
```
http://localhost:3000/api-docs
```

## 🔒 Security Features

- JWT Authentication
- Password Hashing (bcrypt)
- Request Rate Limiting (100 requests per 15 minutes)
- CORS Configuration
- Input Validation
- File Upload Validation
- Role-Based Access Control

## 📝 Error Handling

All endpoints return consistent error objects:
```json
{
  "success": false,
  "error": "Error message"
}
```

## 📊 Logging

Winston logger configured for:
- Console output in development
- File logging in production
- Error tracking
- Request logging

## 👥 Contributors

Group 17 - CIET 204 Mobile Application Development

## 📄 License

MIT License
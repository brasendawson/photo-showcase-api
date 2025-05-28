# Photography Studio API

A RESTful API for a photography studio service that enables clients to browse photos, book photography sessions, and allows photographers to manage their bookings.

## Table of Contents

- Overview
- Features
- Technology Stack
- Getting Started
  - Prerequisites
  - Installation
  - Environment Setup
- API Documentation
  - Authentication Endpoints
  - Photo Gallery Endpoints
  - Booking Endpoints
  - Services Endpoints
  - Categories Endpoints
  - Profile Picture Endpoints
  - Admin Endpoints
  - Health Check Endpoint
- Database Schema
- Testing
- Error Handling
- API Rate Limiting
- Security Considerations

## Overview

Photography Studio API is a complete backend solution for photography services. It handles user registration, authentication, photo gallery management, and session booking for a photography studio.

## Features

- User authentication with JWT and role-based tokens
- Token blacklisting for secure logout
- Role-based access control (admin, photographer, client)
- Photo gallery management with filtering and pagination
- Category-based photo organization
- Booking system for photography sessions
- Photographer assignment to bookings
- Service catalog management
- Profile picture management with Cloudinary
- Booking management for all user roles
- Admin dashboard with user and content management
- Health check endpoint for system monitoring
- API documentation with Swagger UI
- Comprehensive error handling and logging
- Rate limiting for API protection

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL with Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Documentation**: Swagger UI
- **Testing**: Postman Collection
- **Security**: Helmet, XSS-Clean, Express Rate Limit
- **Storage**: Cloudinary for profile pictures
- **Logging**: Winston logger for structured logs

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MySQL database
- npm or yarn
- Cloudinary account (for profile picture storage)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/photo-showcase-api.git
   cd photo-showcase-api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with your environment variables (see Environment Setup).

4. Start the server:
   ```bash
   npm start
   ```

For development with automatic restarts:
```bash
npm run dev
```

### Environment Setup

Create a `.env` file in the root directory with the following variables:

```
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=yourusername
DB_PASSWORD=yourpassword
DB_NAME=photoshowapi
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your_secret_key
JWT_LIFETIME=1d

# Cloudinary Configuration (for profile pictures)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## API Documentation

Interactive API documentation is available at `/api-docs` when the server is running.

### Authentication Endpoints

#### Register User

- **URL**: `/api/auth/register`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "username": "johndoe",
    "email": "john@example.com",
    "password": "Pass123!@#",
    "role": "client"
  }
  ```
  Note: Role must be one of "admin", "photographer", or "client". Password must contain at least one uppercase letter, one number, and one special character.

- **Response**: `201 Created`
  ```json
  {
    "success": true,
    "message": "User created successfully",
    "user": {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "role": "client"
    }
  }
  ```

#### Login User

- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "username": "johndoe",
    "password": "Pass123!@#"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "token": "jwt_token_here",
    "user": {
      "id": 1,
      "username": "johndoe",
      "role": "client"
    }
  }
  ```

#### Logout User

- **URL**: `/api/auth/logout`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer jwt_token_here`
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "message": "Logged out successfully"
  }
  ```

### Photo Gallery Endpoints

#### Get All Photos

- **URL**: `/api/photos`
- **Method**: `GET`
- **Query Parameters**:
  - `category`: Filter by category ID
  - `featured`: Filter by featured status (true/false)
  - `sort`: Sort field(s) with direction (e.g., createdAt:desc)
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "photos": [
      {
        "id": 1,
        "title": "Beach Wedding",
        "description": "Beautiful beach wedding photoshoot",
        "imageUrl": "https://example.com/photos/beach-wedding.jpg",
        "photographerId": 2,
        "categoryId": 1,
        "featured": true,
        "createdAt": "2023-05-10T14:30:00.000Z",
        "updatedAt": "2023-05-10T14:30:00.000Z",
        "category": {
          "id": 1,
          "name": "wedding"
        }
      }
    ],
    "count": 1,
    "totalPhotos": 30,
    "totalPages": 3,
    "currentPage": 1
  }
  ```

#### Get Single Photo

- **URL**: `/api/photos/:id`
- **Method**: `GET`
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "photo": {
      "id": 1,
      "title": "Beach Wedding",
      "description": "Beautiful beach wedding photoshoot",
      "imageUrl": "https://example.com/photos/beach-wedding.jpg",
      "photographerId": 2,
      "categoryId": 1,
      "featured": true,
      "createdAt": "2023-05-10T14:30:00.000Z",
      "updatedAt": "2023-05-10T14:30:00.000Z",
      "category": {
        "id": 1,
        "name": "wedding",
        "description": "Wedding photography"
      }
    }
  }
  ```

#### Add Photo (Photographer or Admin)

- **URL**: `/api/photos`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer jwt_token_here`
- **Content-Type**: `multipart/form-data`
- **Body**:
  - `photo`: Image file (JPG, PNG)
  - `title`: "Family Portrait"
  - `description`: "Professional family portrait session"
  - `categoryId`: 2
  - `featured`: false
- **Response**: `201 Created`
  ```json
  {
    "success": true,
    "message": "Photo uploaded successfully",
    "photo": {
      "id": 2,
      "title": "Family Portrait",
      "description": "Professional family portrait session",
      "imageUrl": "https://res.cloudinary.com/your-cloud-name/image/upload/v1/photos/family-portrait.jpg",
      "photographerId": 2,
      "categoryId": 2,
      "featured": false,
      "createdAt": "2023-05-15T10:20:00.000Z",
      "updatedAt": "2023-05-15T10:20:00.000Z"
    }
  }
  ```

#### Update Photo (Owner or Admin)

- **URL**: `/api/photos/:id`
- **Method**: `PATCH`
- **Headers**: `Authorization: Bearer jwt_token_here`
- **Body**:
  ```json
  {
    "title": "Updated Family Portrait",
    "description": "Updated description for family portrait",
    "featured": true,
    "categoryId": 3
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "message": "Photo updated successfully",
    "photo": {
      "id": 2,
      "title": "Updated Family Portrait",
      "description": "Updated description for family portrait",
      "imageUrl": "https://res.cloudinary.com/your-cloud-name/image/upload/v1/photos/family-portrait.jpg",
      "photographerId": 2,
      "categoryId": 3,
      "featured": true,
      "createdAt": "2023-05-15T10:20:00.000Z",
      "updatedAt": "2023-05-15T11:30:00.000Z"
    }
  }
  ```

#### Delete Photo (Owner or Admin)

- **URL**: `/api/photos/:id`
- **Method**: `DELETE`
- **Headers**: `Authorization: Bearer jwt_token_here`
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "message": "Photo deleted successfully"
  }
  ```

### Categories Endpoints

#### Get All Categories

- **URL**: `/api/categories`
- **Method**: `GET`
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "categories": [
      {
        "id": 1,
        "name": "wedding",
        "description": "Wedding photography",
        "slug": "wedding",
        "createdAt": "2023-05-10T14:30:00.000Z",
        "updatedAt": "2023-05-10T14:30:00.000Z"
      },
      {
        "id": 2,
        "name": "portrait",
        "description": "Portrait photography",
        "slug": "portrait",
        "createdAt": "2023-05-10T14:35:00.000Z",
        "updatedAt": "2023-05-10T14:35:00.000Z"
      }
    ]
  }
  ```

#### Get Category by ID

- **URL**: `/api/categories/:id`
- **Method**: `GET`
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "category": {
      "id": 1,
      "name": "wedding",
      "description": "Wedding photography",
      "slug": "wedding",
      "createdAt": "2023-05-10T14:30:00.000Z",
      "updatedAt": "2023-05-10T14:30:00.000Z"
    }
  }
  ```

#### Create Category (Admin Only)

- **URL**: `/api/categories`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer jwt_token_here`
- **Body**:
  ```json
  {
    "name": "landscape",
    "description": "Landscape photography"
  }
  ```
- **Response**: `201 Created`
  ```json
  {
    "success": true,
    "message": "Category created successfully",
    "category": {
      "id": 3,
      "name": "landscape",
      "description": "Landscape photography",
      "slug": "landscape",
      "createdAt": "2023-06-01T11:20:00.000Z",
      "updatedAt": "2023-06-01T11:20:00.000Z"
    }
  }
  ```

#### Update Category (Admin Only)

- **URL**: `/api/categories/:id`
- **Method**: `PATCH`
- **Headers**: `Authorization: Bearer jwt_token_here`
- **Body**:
  ```json
  {
    "description": "Professional wedding photography"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "message": "Category updated successfully",
    "category": {
      "id": 1,
      "name": "wedding",
      "description": "Professional wedding photography",
      "slug": "wedding",
      "createdAt": "2023-05-10T14:30:00.000Z",
      "updatedAt": "2023-06-02T09:15:00.000Z"
    }
  }
  ```

#### Delete Category (Admin Only)

- **URL**: `/api/categories/:id`
- **Method**: `DELETE`
- **Headers**: `Authorization: Bearer jwt_token_here`
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "message": "Category deleted successfully"
  }
  ```

### Services Endpoints

#### Get All Services

- **URL**: `/api/services`
- **Method**: `GET`
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "services": [
      {
        "id": 1,
        "name": "Wedding Photography",
        "description": "Professional wedding photography services",
        "price": "1200.00",
        "duration": "6-8 hours",
        "createdAt": "2023-05-10T14:30:00.000Z",
        "updatedAt": "2023-05-10T14:30:00.000Z"
      },
      {
        "id": 2,
        "name": "Portrait Session",
        "description": "Professional portrait photography",
        "price": "250.00",
        "duration": "1-2 hours",
        "createdAt": "2023-05-15T10:20:00.000Z",
        "updatedAt": "2023-05-15T10:20:00.000Z"
      }
    ]
  }
  ```

#### Get Service by ID

- **URL**: `/api/services/:id`
- **Method**: `GET`
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "service": {
      "id": 1,
      "name": "Wedding Photography",
      "description": "Professional wedding photography services",
      "price": "1200.00",
      "duration": "6-8 hours",
      "createdAt": "2023-05-10T14:30:00.000Z",
      "updatedAt": "2023-05-10T14:30:00.000Z"
    }
  }
  ```

#### Create Service (Admin Only)

- **URL**: `/api/services`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer jwt_token_here`
- **Body**:
  ```json
  {
    "name": "Commercial Photography",
    "description": "Professional product and commercial photography",
    "price": 800,
    "duration": "4-5 hours"
  }
  ```
- **Response**: `201 Created`
  ```json
  {
    "success": true,
    "service": {
      "id": 3,
      "name": "Commercial Photography",
      "description": "Professional product and commercial photography",
      "price": "800.00",
      "duration": "4-5 hours",
      "createdAt": "2023-06-01T11:20:00.000Z",
      "updatedAt": "2023-06-01T11:20:00.000Z"
    }
  }
  ```

#### Update Service (Admin Only)

- **URL**: `/api/services/:id`
- **Method**: `PATCH`
- **Headers**: `Authorization: Bearer jwt_token_here`
- **Body**:
  ```json
  {
    "description": "Premium wedding photography services with multiple photographers",
    "price": 1500
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "message": "Service updated successfully",
    "service": {
      "id": 1,
      "name": "Wedding Photography",
      "description": "Premium wedding photography services with multiple photographers",
      "price": "1500.00",
      "duration": "6-8 hours",
      "createdAt": "2023-05-10T14:30:00.000Z",
      "updatedAt": "2023-06-02T09:15:00.000Z"
    }
  }
  ```

#### Delete Service (Admin Only)

- **URL**: `/api/services/:id`
- **Method**: `DELETE`
- **Headers**: `Authorization: Bearer jwt_token_here`
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "message": "Service removed successfully"
  }
  ```

### Booking Endpoints

#### Create Booking (Client)

- **URL**: `/api/bookings`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer jwt_token_here`
- **Body**:
  ```json
  {
    "fullName": "John Client",
    "email": "client@example.com",
    "phoneNumber": "555-987-6543",
    "serviceId": 1,
    "date": "2023-12-01",
    "time": "15:30",
    "location": "Central Park",
    "additionalDetails": "Looking for wedding photography for 3 hours"
  }
  ```
- **Response**: `201 Created`
  ```json
  {
    "success": true,
    "message": "Booking created successfully",
    "booking": {
      "id": 1,
      "fullName": "John Client",
      "email": "client@example.com",
      "phoneNumber": "555-987-6543",
      "serviceId": 1,
      "date": "2023-12-01",
      "time": "15:30",
      "location": "Central Park",
      "additionalDetails": "Looking for wedding photography for 3 hours",
      "status": "pending",
      "clientId": 3,
      "updatedAt": "2023-05-20T09:15:00.000Z",
      "createdAt": "2023-05-20T09:15:00.000Z"
    }
  }
  ```

#### Get Client's Bookings

- **URL**: `/api/bookings/my-bookings`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer jwt_token_here`
- **Response**: `200 OK`
  ```json
  {
    "bookings": [
      {
        "id": 1,
        "fullName": "John Client",
        "email": "client@example.com",
        "phoneNumber": "555-987-6543",
        "serviceId": 1,
        "date": "2023-12-01",
        "time": "15:30",
        "location": "Central Park",
        "additionalDetails": "Looking for wedding photography for 3 hours",
        "status": "pending",
        "clientId": 3,
        "createdAt": "2023-05-20T09:15:00.000Z",
        "updatedAt": "2023-05-20T09:15:00.000Z",
        "service": {
          "name": "Wedding Photography",
          "description": "Professional wedding photography services",
          "price": "1500.00",
          "duration": "6-8 hours"
        }
      }
    ]
  }
  ```

#### Get Available Bookings (Photographer)

- **URL**: `/api/bookings/available`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer jwt_token_here`
- **Response**: `200 OK`
  ```json
  {
    "bookings": [
      {
        "id": 1,
        "fullName": "John Client",
        "email": "client@example.com",
        "phoneNumber": "555-987-6543",
        "serviceId": 1,
        "date": "2023-12-01",
        "time": "15:30",
        "location": "Central Park",
        "additionalDetails": "Looking for wedding photography for 3 hours",
        "status": "pending",
        "clientId": 3,
        "createdAt": "2023-05-20T09:15:00.000Z",
        "updatedAt": "2023-05-20T09:15:00.000Z"
      }
    ]
  }
  ```

#### Photographer Accepts Booking

- **URL**: `/api/bookings/:id/accept`
- **Method**: `PATCH`
- **Headers**: `Authorization: Bearer jwt_token_here`
- **Body**:
  ```json
  {
    "additionalDetails": "I'll be your photographer for this session."
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "message": "Booking accepted successfully",
    "booking": {
      "id": 1,
      "status": "confirmed",
      "additionalDetails": "I'll be your photographer for this session."
    }
  }
  ```

#### Get Photographer's Assigned Bookings

- **URL**: `/api/bookings/photographer`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer jwt_token_here`
- **Response**: `200 OK`
  ```json
  {
    "bookings": [
      {
        "id": 1,
        "fullName": "John Client",
        "email": "client@example.com",
        "phoneNumber": "555-987-6543",
        "serviceId": 1,
        "date": "2023-12-01",
        "time": "15:30",
        "location": "Central Park",
        "additionalDetails": "I'll be your photographer for this session.",
        "status": "confirmed",
        "clientId": 3,
        "photographerId": 2,
        "createdAt": "2023-05-20T09:15:00.000Z",
        "updatedAt": "2023-05-25T14:20:00.000Z"
      }
    ]
  }
  ```

#### Admin Assigns Photographer to Booking

- **URL**: `/api/bookings/:id/assign`
- **Method**: `PATCH`
- **Headers**: `Authorization: Bearer jwt_token_here`
- **Body**:
  ```json
  {
    "photographerId": 2
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "message": "Booking assigned successfully",
    "booking": {
      "id": 1,
      "status": "confirmed",
      "photographerId": 2
    }
  }
  ```

#### Get All Bookings (Admin Only)

- **URL**: `/api/bookings/all`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer jwt_token_here`
- **Response**: `200 OK`
  ```json
  {
    "bookings": [
      {
        "id": 1,
        "fullName": "John Client",
        "email": "client@example.com",
        "phoneNumber": "555-987-6543",
        "serviceId": 1,
        "date": "2023-12-01",
        "time": "15:30",
        "location": "Central Park",
        "additionalDetails": "I'll be your photographer for this session.",
        "status": "confirmed",
        "clientId": 3,
        "photographerId": 2,
        "createdAt": "2023-05-20T09:15:00.000Z",
        "updatedAt": "2023-05-25T14:20:00.000Z"
      }
    ]
  }
  ```

### Profile Picture Endpoints

#### Upload Profile Picture

- **URL**: `/api/profile/picture`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer jwt_token_here`
- **Content-Type**: `multipart/form-data`
- **Body**:
  - `profilePicture`: Image file (JPG, PNG, etc.)
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "message": "Profile picture updated successfully",
    "profilePicture": "https://res.cloudinary.com/your-cloud-name/image/upload/v1/profile-pictures/profile-1-123456789.jpg"
  }
  ```

#### Get Profile Picture

- **URL**: `/api/profile/picture`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer jwt_token_here`
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "profilePicture": "https://res.cloudinary.com/your-cloud-name/image/upload/v1/profile-pictures/profile-1-123456789.jpg"
  }
  ```

#### Delete Profile Picture

- **URL**: `/api/profile/picture`
- **Method**: `DELETE`
- **Headers**: `Authorization: Bearer jwt_token_here`
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "message": "Profile picture reset to default"
  }
  ```

### Admin Endpoints

#### Get All Users (Admin Only)

- **URL**: `/api/admin/users`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer jwt_token_here`
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "users": [
      {
        "id": 1,
        "username": "adminuser",
        "email": "admin@example.com",
        "role": "admin",
        "createdAt": "2023-05-01T10:00:00.000Z"
      },
      {
        "id": 2,
        "username": "janephotographer",
        "email": "jane@example.com",
        "role": "photographer",
        "createdAt": "2023-05-02T11:30:00.000Z"
      }
    ],
    "count": 2
  }
  ```

#### Update User Role (Admin Only)

- **URL**: `/api/admin/users/role`
- **Method**: `PUT`
- **Headers**: `Authorization: Bearer jwt_token_here`
- **Body**:
  ```json
  {
    "username": "johndoe",
    "newRole": "photographer"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "message": "User role updated successfully",
    "user": {
      "id": 3,
      "username": "johndoe",
      "role": "photographer"
    }
  }
  ```

#### Get Dashboard Stats (Admin Only)

- **URL**: `/api/admin/dashboard`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer jwt_token_here`
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "stats": {
      "users": {
        "total": 10,
        "photographers": 3,
        "clients": 6,
        "admins": 1
      },
      "photos": {
        "total": 25,
        "featured": 5
      },
      "bookings": {
        "total": 15,
        "pending": 5,
        "confirmed": 8,
        "completed": 2
      },
      "services": {
        "total": 4
      }
    }
  }
  ```

### Health Check Endpoint

#### API Health Status

- **URL**: `/`
- **Method**: `GET`
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "message": "Photography Showcase API is running",
    "version": "1.0.0",
    "timestamp": "2023-06-15T14:30:00.000Z"
  }
  ```

## Database Schema

### User

- id: INT (Primary Key)
- username: STRING (Unique)
- email: STRING (Unique)
- password: STRING (Hashed)
- role: ENUM ('admin', 'photographer', 'client')
- profilePicture: STRING
- createdAt: DATE
- updatedAt: DATE

### Photo

- id: INT (Primary Key)
- title: STRING
- description: TEXT
- imageUrl: STRING
- photographerId: INT (Foreign Key → User.id)
- categoryId: INT (Foreign Key → Category.id)
- featured: BOOLEAN
- createdAt: DATE
- updatedAt: DATE

### Category

- id: INT (Primary Key)
- name: STRING (Unique)
- description: TEXT
- slug: STRING (Unique)
- createdAt: DATE
- updatedAt: DATE

### Booking

- id: INT (Primary Key)
- fullName: STRING
- email: STRING
- phoneNumber: STRING
- serviceId: INT (Foreign Key → Service.id)
- date: DATEONLY
- time: STRING
- location: STRING
- additionalDetails: TEXT
- status: ENUM ('pending', 'confirmed', 'completed', 'cancelled')
- clientId: INT (Foreign Key → User.id)
- photographerId: INT (Foreign Key → User.id, nullable)
- createdAt: DATE
- updatedAt: DATE

### Service

- id: INT (Primary Key)
- name: STRING
- description: TEXT
- price: DECIMAL(10,2)
- duration: STRING
- createdAt: DATE
- updatedAt: DATE

## Testing

The API includes a comprehensive Postman collection for testing all endpoints:

1. Import the `Photo-Showcase-API.postman_collection.json` file into Postman
2. Set up environment variables:
   - `baseUrl`: Your API URL (e.g., `http://localhost:3000`)
3. Run the collection to test authentication, photo management, bookings, services, and admin functions

## Error Handling

The API uses consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

All errors are logged to `logs/error.log` for debugging purposes.

## API Rate Limiting

The API implements rate limiting to prevent abuse:
- 100 requests per 15-minute window per IP address
- When the limit is reached, the API returns a `429 Too Many Requests` status

## Security Considerations

- Passwords are hashed using bcrypt
- JWT tokens for authentication with role information
- Token blacklisting for secure logout
- Role-based access control for protected routes
- Helmet for security-related HTTP headers
- XSS protection via input sanitization
- CORS configuration
- Cloudinary secure URLs for media storage


# Photo Showcase API

A RESTful API for a photography showcase and booking platform that allows users to browse photographers, view their work, and book photography sessions.

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
  - User Endpoints
  - Photo Endpoints
  - Category Endpoints
  - Booking Endpoints
  - Review Endpoints
  - Admin Endpoints
- Database Schema
- Testing
- Error Handling
- API Rate Limiting
- Security Considerations

## Overview

Photo Showcase API is a complete backend solution for photography services. It handles user registration, authentication, portfolio management, session booking, and reviews.

## Features

- User authentication with JWT
- Role-based access control (admin, photographer, client)
- Photo upload and management
- Category organization for photos
- Booking system for photography sessions
- Review and rating system
- Admin dashboard for platform management

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL with Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Documentation**: Swagger UI
- **Testing**: Postman Collection
- **Logging**: Custom logger
- **Rate Limiting**: Express Rate Limit

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MySQL database
- npm or yarn

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

3. Create a `.env` file in the config directory with your environment variables (see Environment Setup).

4. Start the server:
   ```bash
   npm start
   ```

For development with automatic restarts:
```bash
npm run dev
```

### Environment Setup

Create a `.env` file in the config directory with the following variables:

```
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=yourusername
DB_PASS=yourpassword
DB_NAME=photo_showcase

# JWT Configuration
JWT_SECRET=your_secret_key
JWT_EXPIRE=24h

# File Upload Configuration
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5000000

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

## API Documentation

### Authentication Endpoints

#### Register User

- **URL**: `/api/auth/register`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "username": "johndoe",
    "email": "john@example.com",
    "password": "securepassword",
    "role": "client"
  }
  ```
- **Response**: `201 Created`
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "role": "client"
    },
    "token": "jwt_token_here"
  }
  ```

#### Login User

- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "securepassword"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "role": "client"
    },
    "token": "jwt_token_here"
  }
  ```

### User Endpoints

#### Get Current User Profile

- **URL**: `/api/auth/me`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer jwt_token_here`
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "role": "client",
      "bio": "Photography enthusiast",
      "createdAt": "2023-01-01T00:00:00.000Z"
    }
  }
  ```

#### Update User Profile

- **URL**: `/api/auth/me`
- **Method**: `PUT`
- **Headers**: `Authorization: Bearer jwt_token_here`
- **Body**:
  ```json
  {
    "bio": "Photography enthusiast and nature lover",
    "password": "newsecurepassword"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "role": "client",
      "bio": "Photography enthusiast and nature lover",
      "updatedAt": "2023-01-02T00:00:00.000Z"
    }
  }
  ```

### Photo Endpoints

#### Get All Photos

- **URL**: `/api/photos`
- **Method**: `GET`
- **Query Parameters**:
  - `page`: Page number for pagination (default: 1)
  - `limit`: Number of photos per page (default: 10)
  - `category`: Filter by category ID
  - `photographer`: Filter by photographer ID
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "count": 50,
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "nextPage": 2,
      "prevPage": null
    },
    "data": [
      {
        "id": 1,
        "title": "Beach Sunset",
        "description": "Beautiful sunset at the beach",
        "imageUrl": "/uploads/photos/beach-sunset.jpg",
        "photographerId": 2,
        "categoryId": 3,
        "createdAt": "2023-01-01T00:00:00.000Z",
        "photographer": {
          "id": 2,
          "username": "janephotographer"
        },
        "category": {
          "id": 3,
          "name": "Landscape"
        }
      }
    ]
  }
  ```

#### Get Photo by ID

- **URL**: `/api/photos/:id`
- **Method**: `GET`
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "title": "Beach Sunset",
      "description": "Beautiful sunset at the beach",
      "imageUrl": "/uploads/photos/beach-sunset.jpg",
      "photographerId": 2,
      "categoryId": 3,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "photographer": {
        "id": 2,
        "username": "janephotographer",
        "email": "jane@example.com",
        "bio": "Professional photographer specializing in landscapes"
      },
      "category": {
        "id": 3,
        "name": "Landscape",
        "description": "Landscape photography"
      }
    }
  }
  ```

#### Upload New Photo (Photographer Only)

- **URL**: `/api/photos`
- **Method**: `POST`
- **Headers**: 
  - `Authorization: Bearer jwt_token_here`
  - `Content-Type: multipart/form-data`
- **Body**:
  - `title`: Photo title
  - `description`: Photo description
  - `categoryId`: Category ID
  - `image`: Image file
- **Response**: `201 Created`
  ```json
  {
    "success": true,
    "data": {
      "id": 51,
      "title": "Mountain Lake",
      "description": "Serene mountain lake at dawn",
      "imageUrl": "/uploads/photos/mountain-lake.jpg",
      "photographerId": 2,
      "categoryId": 3,
      "createdAt": "2023-01-05T00:00:00.000Z"
    }
  }
  ```

#### Update Photo (Owner or Admin Only)

- **URL**: `/api/photos/:id`
- **Method**: `PUT`
- **Headers**: `Authorization: Bearer jwt_token_here`
- **Body**:
  ```json
  {
    "title": "Mountain Lake Dawn",
    "description": "Updated description with more details",
    "categoryId": 4
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "data": {
      "id": 51,
      "title": "Mountain Lake Dawn",
      "description": "Updated description with more details",
      "imageUrl": "/uploads/photos/mountain-lake.jpg",
      "photographerId": 2,
      "categoryId": 4,
      "updatedAt": "2023-01-06T00:00:00.000Z"
    }
  }
  ```

#### Delete Photo (Owner or Admin Only)

- **URL**: `/api/photos/:id`
- **Method**: `DELETE`
- **Headers**: `Authorization: Bearer jwt_token_here`
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "data": {}
  }
  ```

### Category Endpoints

#### Get All Categories

- **URL**: `/api/categories`
- **Method**: `GET`
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "count": 5,
    "data": [
      {
        "id": 1,
        "name": "Portrait",
        "description": "Portrait photography"
      },
      {
        "id": 2,
        "name": "Wedding",
        "description": "Wedding photography"
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
    "data": {
      "id": 3,
      "name": "Landscape",
      "description": "Landscape photography",
      "photos": [
        {
          "id": 1,
          "title": "Beach Sunset",
          "imageUrl": "/uploads/photos/beach-sunset.jpg"
        }
      ]
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
    "name": "Wildlife",
    "description": "Wildlife photography"
  }
  ```
- **Response**: `201 Created`
  ```json
  {
    "success": true,
    "data": {
      "id": 6,
      "name": "Wildlife",
      "description": "Wildlife photography"
    }
  }
  ```

#### Update Category (Admin Only)

- **URL**: `/api/categories/:id`
- **Method**: `PUT`
- **Headers**: `Authorization: Bearer jwt_token_here`
- **Body**:
  ```json
  {
    "name": "Wildlife & Nature",
    "description": "Wildlife and nature photography"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "data": {
      "id": 6,
      "name": "Wildlife & Nature",
      "description": "Wildlife and nature photography"
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
    "data": {}
  }
  ```

### Booking Endpoints

#### Create Booking

- **URL**: `/api/bookings`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer jwt_token_here`
- **Body**:
  ```json
  {
    "photographerId": 2,
    "date": "2023-06-15T14:00:00.000Z",
    "location": "Central Park",
    "package": "Standard",
    "notes": "Family photoshoot"
  }
  ```
- **Response**: `201 Created`
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "userId": 3,
      "photographerId": 2,
      "date": "2023-06-15T14:00:00.000Z",
      "location": "Central Park",
      "package": "Standard",
      "notes": "Family photoshoot",
      "status": "pending",
      "photographer": {
        "id": 2,
        "username": "janephotographer",
        "email": "jane@example.com"
      },
      "client": {
        "id": 3,
        "username": "client_user",
        "email": "client@example.com"
      }
    }
  }
  ```

#### Get My Bookings (Client)

- **URL**: `/api/bookings`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer jwt_token_here`
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "count": 2,
    "data": [
      {
        "id": 1,
        "date": "2023-06-15T14:00:00.000Z",
        "location": "Central Park",
        "package": "Standard",
        "status": "pending",
        "photographer": {
          "id": 2,
          "username": "janephotographer",
          "email": "jane@example.com"
        }
      }
    ]
  }
  ```

#### Get Photographer Bookings

- **URL**: `/api/bookings/photographer`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer jwt_token_here`
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "count": 3,
    "data": [
      {
        "id": 1,
        "date": "2023-06-15T14:00:00.000Z",
        "location": "Central Park",
        "package": "Standard",
        "status": "pending",
        "client": {
          "id": 3,
          "username": "client_user",
          "email": "client@example.com"
        }
      }
    ]
  }
  ```

#### Update Booking

- **URL**: `/api/bookings/:id`
- **Method**: `PUT`
- **Headers**: `Authorization: Bearer jwt_token_here`
- **Body** (Client can update location, date, notes):
  ```json
  {
    "location": "Battery Park",
    "notes": "Changed location for better lighting"
  }
  ```
- **Body** (Photographer can update status, notes):
  ```json
  {
    "status": "confirmed",
    "notes": "Looking forward to the session!"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "date": "2023-06-15T14:00:00.000Z",
      "location": "Battery Park",
      "package": "Standard",
      "notes": "Changed location for better lighting",
      "status": "confirmed"
    }
  }
  ```

#### Cancel Booking

- **URL**: `/api/bookings/:id`
- **Method**: `DELETE`
- **Headers**: `Authorization: Bearer jwt_token_here`
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "message": "Booking cancelled successfully"
  }
  ```

### Review Endpoints

#### Create Review

- **URL**: `/api/reviews`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer jwt_token_here`
- **Body**:
  ```json
  {
    "photographerId": 2,
    "rating": 5,
    "comment": "Excellent photographer, highly recommended!"
  }
  ```
- **Response**: `201 Created`
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "userId": 3,
      "photographerId": 2,
      "rating": 5,
      "comment": "Excellent photographer, highly recommended!",
      "createdAt": "2023-01-20T00:00:00.000Z"
    }
  }
  ```

#### Get Reviews for a Photographer

- **URL**: `/api/reviews/photographer/:id`
- **Method**: `GET`
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "count": 10,
    "averageRating": 4.8,
    "data": [
      {
        "id": 1,
        "rating": 5,
        "comment": "Excellent photographer, highly recommended!",
        "createdAt": "2023-01-20T00:00:00.000Z",
        "user": {
          "id": 3,
          "username": "client_user"
        }
      }
    ]
  }
  ```

#### Update Review

- **URL**: `/api/reviews/:id`
- **Method**: `PUT`
- **Headers**: `Authorization: Bearer jwt_token_here`
- **Body**:
  ```json
  {
    "rating": 4,
    "comment": "Updated review after second session. Still very good!"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "rating": 4,
      "comment": "Updated review after second session. Still very good!",
      "updatedAt": "2023-01-25T00:00:00.000Z"
    }
  }
  ```

#### Delete Review

- **URL**: `/api/reviews/:id`
- **Method**: `DELETE`
- **Headers**: `Authorization: Bearer jwt_token_here`
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "data": {}
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
    "count": 20,
    "data": [
      {
        "id": 1,
        "username": "admin_user",
        "email": "admin@example.com",
        "role": "admin",
        "createdAt": "2023-01-01T00:00:00.000Z"
      },
      {
        "id": 2,
        "username": "janephotographer",
        "email": "jane@example.com",
        "role": "photographer",
        "createdAt": "2023-01-01T00:00:00.000Z"
      }
    ]
  }
  ```

#### Update User Role (Admin Only)

- **URL**: `/api/admin/users/:id`
- **Method**: `PUT`
- **Headers**: `Authorization: Bearer jwt_token_here`
- **Body**:
  ```json
  {
    "role": "photographer"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "data": {
      "id": 3,
      "username": "client_user",
      "email": "client@example.com",
      "role": "photographer",
      "updatedAt": "2023-01-25T00:00:00.000Z"
    }
  }
  ```

#### Delete User (Admin Only)

- **URL**: `/api/admin/users/:id`
- **Method**: `DELETE`
- **Headers**: `Authorization: Bearer jwt_token_here`
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "data": {}
  }
  ```

#### Get System Statistics (Admin Only)

- **URL**: `/api/admin/stats`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer jwt_token_here`
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "data": {
      "users": {
        "total": 100,
        "photographers": 25,
        "clients": 74,
        "admins": 1
      },
      "photos": {
        "total": 500,
        "byCategory": {
          "Portrait": 150,
          "Wedding": 120,
          "Landscape": 230
        }
      },
      "bookings": {
        "total": 75,
        "pending": 15,
        "confirmed": 40,
        "completed": 15,
        "canceled": 5
      },
      "reviews": {
        "total": 65,
        "averageRating": 4.6
      }
    }
  }
  ```

## Database Schema

### User

- id: INT (Primary Key)
- username: VARCHAR(50) (Unique)
- email: VARCHAR(100) (Unique)
- password: VARCHAR(100) (Hashed)
- role: ENUM ('client', 'photographer', 'admin')
- bio: TEXT
- profileImage: VARCHAR(255)
- createdAt: DATETIME
- updatedAt: DATETIME

### Category

- id: INT (Primary Key)
- name: VARCHAR(50) (Unique)
- description: TEXT
- createdAt: DATETIME
- updatedAt: DATETIME

### Photo

- id: INT (Primary Key)
- title: VARCHAR(100)
- description: TEXT
- imageUrl: VARCHAR(255)
- photographerId: INT (Foreign Key → User.id)
- categoryId: INT (Foreign Key → Category.id)
- createdAt: DATETIME
- updatedAt: DATETIME

### Booking

- id: INT (Primary Key)
- userId: INT (Foreign Key → User.id)
- photographerId: INT (Foreign Key → User.id)
- date: DATETIME
- location: VARCHAR(255)
- package: VARCHAR(100)
- notes: TEXT
- status: ENUM ('pending', 'confirmed', 'completed', 'canceled')
- createdAt: DATETIME
- updatedAt: DATETIME

### Review

- id: INT (Primary Key)
- userId: INT (Foreign Key → User.id)
- photographerId: INT (Foreign Key → User.id)
- rating: INT (1-5)
- comment: TEXT
- createdAt: DATETIME
- updatedAt: DATETIME

## Testing

The API includes a comprehensive Postman collection for testing all endpoints. To use it:

1. Import the Photo-Showcase-API.postman_collection.json file into Postman
2. Set up a Postman environment with the following variables:
   - `baseUrl`: The base URL of your API (e.g., `http://localhost:3000`)
   - `admin_token`: JWT token for an admin user
   - `photographer_token`: JWT token for a photographer
   - `user_token`: JWT token for a regular client

Run the tests in the following order:
1. Authentication tests
2. User management tests
3. Category tests
4. Photo tests
5. Booking tests
6. Review tests
7. Admin tests

## Error Handling

The API uses a standardized error response format:

```json
{
  "success": false,
  "error": "Detailed error message"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Resource created
- `400`: Bad request
- `401`: Unauthorized (missing or invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Resource not found
- `500`: Server error

## API Rate Limiting

The API implements rate limiting to prevent abuse:
- 100 requests per 15-minute window per IP address
- When the limit is reached, the API returns a `429 Too Many Requests` status

## Security Considerations

- Passwords are hashed using bcrypt
- JWT tokens expire after 24 hours
- Role-based access control for all protected routes
- Input validation for all requests
- Protection against common web vulnerabilities (XSS, CSRF)
- HTTPS recommended for production deployments
- File uploads are validated for type and size
- Sensitive information is never exposed in responses


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
  - Profile Picture Endpoints
- Database Schema
- Testing
- Error Handling
- API Rate Limiting
- Security Considerations

## Overview

Photography Studio API is a complete backend solution for photography services. It handles user registration, authentication, photo gallery management, and session booking for a photography studio.

## Features

- User authentication with JWT
- Role-based access control (admin, photographer, client)
- Photo gallery management by admins
- Booking system for photography sessions
- Photographer assignment to bookings
- Service catalog management
- Profile picture management with Cloudinary
- Booking management for all user roles

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL with Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Documentation**: Swagger UI
- **Testing**: Postman Collection
- **Security**: Helmet, XSS-Clean, Express Rate Limit
- **Storage**: Cloudinary for profile pictures

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

# Database Reset Flag (set to true only when you need to reset all tables)
DB_RESET=false

# Cloudinary Configuration (for profile pictures)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
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
  Note: Role is optional and defaults to "client" if not provided. Available roles are "admin", "photographer", and "client".

- **Response**: `201 Created`
  ```json
  {
    "user": {
      "username": "johndoe",
      "email": "john@example.com",
      "role": "client",
      "id": 1
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
    "username": "johndoe",
    "password": "securepassword"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "user": {
      "username": "johndoe",
      "email": "john@example.com",
      "role": "client",
      "id": 1
    },
    "token": "jwt_token_here"
  }
  ```

### Photo Gallery Endpoints

#### Get All Photos

- **URL**: `/api/photos`
- **Method**: `GET`
- **Query Parameters**:
  - `type`: Filter by photo type (portrait, wedding, event, landscape, commercial, other)
  - `featured`: Filter by featured status (true/false)
  - `sort`: Sort field(s) with direction (e.g., createdAt:desc)
- **Response**: `200 OK`
  ```json
  {
    "photos": [
      {
        "id": 1,
        "title": "Beach Wedding",
        "description": "Beautiful beach wedding photoshoot",
        "imageUrl": "https://example.com/photos/beach-wedding.jpg",
        "photographerName": "Jane Smith",
        "type": "wedding",
        "featured": true,
        "createdAt": "2023-05-10T14:30:00.000Z",
        "updatedAt": "2023-05-10T14:30:00.000Z"
      }
    ],
    "count": 1
  }
  ```

#### Get Gallery Photos (Paginated)

- **URL**: `/api/photos/gallery`
- **Method**: `GET`
- **Query Parameters**:
  - `type`: Filter by photo type
  - `limit`: Number of photos per page (default: 20)
  - `page`: Page number (default: 1)
- **Response**: `200 OK`
  ```json
  {
    "photos": [
      {
        "title": "Beach Wedding",
        "imageUrl": "https://example.com/photos/beach-wedding.jpg",
        "type": "wedding",
        "photographerName": "Jane Smith"
      }
    ],
    "count": 1,
    "totalPhotos": 30,
    "numOfPages": 2,
    "currentPage": 1
  }
  ```

#### Get Single Photo

- **URL**: `/api/photos/:id`
- **Method**: `GET`
- **Response**: `200 OK`
  ```json
  {
    "photo": {
      "id": 1,
      "title": "Beach Wedding",
      "description": "Beautiful beach wedding photoshoot",
      "imageUrl": "https://example.com/photos/beach-wedding.jpg",
      "photographerName": "Jane Smith",
      "type": "wedding",
      "featured": true,
      "createdAt": "2023-05-10T14:30:00.000Z",
      "updatedAt": "2023-05-10T14:30:00.000Z"
    }
  }
  ```

#### Add Photo to Gallery (Admin Only)

- **URL**: `/api/photos`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer jwt_token_here`
- **Body**:
  ```json
  {
    "title": "Family Portrait",
    "description": "Professional family portrait session",
    "imageUrl": "https://example.com/photos/family-portrait.jpg",
    "photographerName": "Jane Smith",
    "type": "portrait",
    "featured": false
  }
  ```
- **Response**: `201 Created`
  ```json
  {
    "photo": {
      "id": 2,
      "title": "Family Portrait",
      "description": "Professional family portrait session",
      "imageUrl": "https://example.com/photos/family-portrait.jpg",
      "photographerName": "Jane Smith",
      "type": "portrait",
      "featured": false,
      "createdAt": "2023-05-15T10:20:00.000Z",
      "updatedAt": "2023-05-15T10:20:00.000Z"
    }
  }
  ```

#### Update Photo (Admin Only)

- **URL**: `/api/photos/:id`
- **Method**: `PATCH`
- **Headers**: `Authorization: Bearer jwt_token_here`
- **Body**:
  ```json
  {
    "title": "Updated Family Portrait",
    "description": "Updated description for family portrait",
    "featured": true
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "photo": {
      "id": 2,
      "title": "Updated Family Portrait",
      "description": "Updated description for family portrait",
      "imageUrl": "https://example.com/photos/family-portrait.jpg",
      "photographerName": "Jane Smith",
      "type": "portrait",
      "featured": true,
      "createdAt": "2023-05-15T10:20:00.000Z",
      "updatedAt": "2023-05-15T11:30:00.000Z"
    }
  }
  ```

#### Delete Photo (Admin Only)

- **URL**: `/api/photos/:id`
- **Method**: `DELETE`
- **Headers**: `Authorization: Bearer jwt_token_here`
- **Response**: `200 OK`
  ```json
  {
    "msg": "Success! Photo deleted."
  }
  ```

### Services Endpoints

#### Get All Services

- **URL**: `/api/services`
- **Method**: `GET`
- **Response**: `200 OK`
  ```json
  {
    "services": [
      {
        "id": 1,
        "name": "Wedding Photography",
        "description": "Professional wedding photography services",
        "price": "1200.00",
        "duration": "6-8 hours",
        "isActive": true,
        "createdAt": "2023-05-10T14:30:00.000Z",
        "updatedAt": "2023-05-10T14:30:00.000Z"
      },
      {
        "id": 2,
        "name": "Portrait Session",
        "description": "Professional portrait photography",
        "price": "250.00",
        "duration": "1-2 hours",
        "isActive": true,
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
    "service": {
      "id": 1,
      "name": "Wedding Photography",
      "description": "Professional wedding photography services",
      "price": "1200.00",
      "duration": "6-8 hours",
      "isActive": true,
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
    "service": {
      "id": 3,
      "name": "Commercial Photography",
      "description": "Professional product and commercial photography",
      "price": "800.00",
      "duration": "4-5 hours",
      "isActive": true,
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
    "service": {
      "id": 1,
      "name": "Wedding Photography",
      "description": "Premium wedding photography services with multiple photographers",
      "price": "1500.00",
      "duration": "6-8 hours",
      "isActive": true,
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
    "fullName": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "555-123-4567",
    "sessionType": "wedding",
    "date": "2023-12-01",
    "time": "15:30",
    "location": "Central Park",
    "additionalDetails": "Looking for a wedding photographer for 3 hours"
  }
  ```
- **Response**: `201 Created`
  ```json
  {
    "booking": {
      "id": 1,
      "fullName": "John Doe",
      "email": "john@example.com",
      "phoneNumber": "555-123-4567",
      "sessionType": "wedding",
      "date": "2023-12-01",
      "time": "15:30",
      "location": "Central Park",
      "additionalDetails": "Looking for a wedding photographer for 3 hours",
      "status": "pending",
      "client": 1,
      "createdAt": "2023-05-20T09:15:00.000Z",
      "updatedAt": "2023-05-20T09:15:00.000Z"
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
        "fullName": "John Doe",
        "email": "john@example.com",
        "sessionType": "wedding",
        "date": "2023-12-01",
        "time": "15:30",
        "location": "Central Park",
        "status": "pending",
        "createdAt": "2023-05-20T09:15:00.000Z",
        "assignedPhotographer": null
      }
    ],
    "count": 1
  }
  ```

#### Get Specific Client Booking

- **URL**: `/api/bookings/my-bookings/:id`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer jwt_token_here`
- **Response**: `200 OK`
  ```json
  {
    "booking": {
      "id": 1,
      "fullName": "John Doe",
      "email": "john@example.com",
      "phoneNumber": "555-123-4567",
      "sessionType": "wedding",
      "date": "2023-12-01",
      "time": "15:30",
      "location": "Central Park",
      "additionalDetails": "Looking for a wedding photographer for 3 hours",
      "status": "pending",
      "client": 1,
      "assignedPhotographer": null,
      "createdAt": "2023-05-20T09:15:00.000Z",
      "updatedAt": "2023-05-20T09:15:00.000Z"
    }
  }
  ```

#### Update Client Booking

- **URL**: `/api/bookings/my-bookings/:id`
- **Method**: `PATCH`
- **Headers**: `Authorization: Bearer jwt_token_here`
- **Body**:
  ```json
  {
    "location": "City Hall",
    "additionalDetails": "Changed venue to City Hall instead of Central Park"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "booking": {
      "id": 1,
      "fullName": "John Doe",
      "email": "john@example.com",
      "phoneNumber": "555-123-4567",
      "sessionType": "wedding",
      "date": "2023-12-01",
      "time": "15:30",
      "location": "City Hall",
      "additionalDetails": "Changed venue to City Hall instead of Central Park",
      "status": "pending",
      "client": 1,
      "assignedPhotographer": null,
      "createdAt": "2023-05-20T09:15:00.000Z",
      "updatedAt": "2023-05-20T10:30:00.000Z"
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
        "fullName": "John Doe",
        "email": "john@example.com",
        "phoneNumber": "555-123-4567",
        "sessionType": "wedding",
        "date": "2023-12-01",
        "time": "15:30",
        "location": "City Hall",
        "status": "confirmed",
        "client": {
          "id": 1,
          "name": "John Doe",
          "email": "john@example.com",
          "phoneNumber": "555-123-4567"
        }
      }
    ],
    "count": 1
  }
  ```

#### Update Booking (Photographer)

- **URL**: `/api/bookings/:id`
- **Method**: `PUT`
- **Headers**: `Authorization: Bearer jwt_token_here`
- **Body**:
  ```json
  {
    "status": "confirmed",
    "additionalDetails": "Looking forward to meeting you for the wedding shoot!"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "booking": {
      "id": 1,
      "status": "confirmed",
      "additionalDetails": "Looking forward to meeting you for the wedding shoot!",
      "updatedAt": "2023-05-25T14:20:00.000Z",
      "client": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "phoneNumber": "555-123-4567"
      },
      "assignedPhotographer": {
        "id": 2,
        "name": "Jane Smith",
        "email": "jane@example.com"
      }
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
    "message": "Booking cancelled successfully",
    "booking": {
      "id": 1,
      "status": "cancelled",
      "updatedAt": "2023-05-26T09:15:00.000Z"
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
        "fullName": "John Doe",
        "email": "john@example.com",
        "sessionType": "wedding",
        "date": "2023-12-01",
        "time": "15:30",
        "location": "City Hall",
        "status": "confirmed",
        "client": {
          "id": 1,
          "name": "John Doe",
          "email": "john@example.com"
        },
        "assignedPhotographer": {
          "id": 2,
          "name": "Jane Smith",
          "email": "jane@example.com"
        }
      }
    ],
    "count": 1
  }
  ```

#### Assign Photographer to Booking (Admin Only)

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
    "booking": {
      "id": 1,
      "status": "confirmed",
      "assignedPhotographer": {
        "id": 2,
        "name": "Jane Smith",
        "email": "jane@example.com"
      },
      "client": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "phoneNumber": "555-123-4567"
      },
      "updatedAt": "2023-05-27T11:30:00.000Z"
    }
  }
  ```

#### Update Booking Status (Admin Only)

- **URL**: `/api/bookings/:id/status`
- **Method**: `PATCH`
- **Headers**: `Authorization: Bearer jwt_token_here`
- **Body**:
  ```json
  {
    "status": "completed"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "booking": {
      "id": 1,
      "status": "completed",
      "updatedAt": "2023-05-28T16:45:00.000Z"
    }
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

#### Delete Profile Picture (Reset to Default)

- **URL**: `/api/profile/picture`
- **Method**: `DELETE`
- **Headers**: `Authorization: Bearer jwt_token_here`
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "message": "Profile picture reset to default",
    "profilePicture": "https://res.cloudinary.com/your-cloud-name/image/upload/v1/profile-pictures/default-profile.jpg"
  }
  ```

## Database Schema

### User

- id: INT (Primary Key)
- username: STRING
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
- photographerName: STRING
- type: ENUM ('portrait', 'wedding', 'event', 'landscape', 'commercial', 'other')
- featured: BOOLEAN
- createdAt: DATE
- updatedAt: DATE

### Booking

- id: INT (Primary Key)
- fullName: STRING
- email: STRING
- phoneNumber: STRING
- sessionType: ENUM ('portrait', 'wedding', 'event', 'commercial', 'other')
- date: DATEONLY
- time: STRING
- location: STRING
- additionalDetails: TEXT
- status: ENUM ('pending', 'confirmed', 'completed', 'cancelled')
- client: INT (Foreign Key → User.id)
- assignedPhotographer: INT (Foreign Key → User.id)
- createdAt: DATE
- updatedAt: DATE

### Service

- id: INT (Primary Key)
- name: STRING
- description: TEXT
- price: DECIMAL(10,2)
- duration: STRING
- isActive: BOOLEAN
- createdAt: DATE
- updatedAt: DATE

## Testing

The API includes a Postman collection for testing all endpoints. To use it:

1. Import the Photo-Showcase-API.postman_collection.json file into Postman
2. Set up environment variables:
   - `baseUrl`: Your API URL (e.g., `http://localhost:3000`)
3. Run the collection from start to finish to test all endpoints automatically
   - The collection will register admin, photographer, and client users
   - It will then test all endpoints with appropriate authentication
   - It will test profile picture upload/management for all user roles
   - It will test services management (admin only)
   - It will test bookings creation and management

## Error Handling

The API uses consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Resource created
- `400`: Bad request or validation error
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
- JWT tokens for authentication
- Role-based access control for protected routes
- Helmet for setting security-related HTTP headers
- XSS protection
- Input validation
- CORS configuration

## Development Notes

### Database Reset

When you need to recreate all database tables (for example, after major schema changes):

1. Set `DB_RESET=true` in your `.env` file
2. Start the server once to recreate all tables
3. Set `DB_RESET=false` in your `.env` file to prevent data loss on future restarts

This operation will delete all existing data in the database, so use with caution.


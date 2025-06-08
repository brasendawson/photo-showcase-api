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
  - Admin Endpoints
  - Health Check Endpoint
  - About Page Endpoints
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
- Photo gallery management
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
   git clone https://github.com/brasendawson/photo-showcase-api.git
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
PORT=3001
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
  - `type`: Filter by photo type (portrait, wedding, event, commercial, landscape, family, other)
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
        "imageUrl": "https://res.cloudinary.com/your-cloud-name/image/upload/v1/photo-showcase/beach-wedding.jpg",
        "photographerName": "Jane Photographer",
        "type": "wedding",
        "featured": true,
        "createdAt": "2023-05-10T14:30:00.000Z",
        "updatedAt": "2023-05-10T14:30:00.000Z"
      }
    ],
    "count": 1
  }
  ```

#### Get Gallery Photos

- **URL**: `/api/photos/gallery`
- **Method**: `GET`
- **Query Parameters**:
  - `type`: Filter by photo type (portrait, wedding, event, commercial, landscape, family, other)
- **Response**: `200 OK`
  ```json
  {
    "photos": [
      {
        "id": 1,
        "title": "Beach Wedding",
        "imageUrl": "https://res.cloudinary.com/your-cloud-name/image/upload/v1/photo-showcase/beach-wedding.jpg",
        "type": "wedding",
        "photographerName": "Jane Photographer"
      },
      {
        "id": 2,
        "title": "Family Portrait",
        "imageUrl": "https://res.cloudinary.com/your-cloud-name/image/upload/v1/photo-showcase/family-portrait.jpg",
        "type": "portrait",
        "photographerName": "John Smith"
      }
    ]
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
      "imageUrl": "https://res.cloudinary.com/your-cloud-name/image/upload/v1/photo-showcase/beach-wedding.jpg",
      "photographerName": "Jane Photographer",
      "type": "wedding",
      "featured": true,
      "createdAt": "2023-05-10T14:30:00.000Z",
      "updatedAt": "2023-05-10T14:30:00.000Z"
    }
  }
  ```

#### Add Photo (Admin Only)

- **URL**: `/api/photos`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer jwt_token_here`
- **Content-Type**: `multipart/form-data`
- **Body**:
  - `title`: Photo title
  - `description`: Photo description
  - `image`: Image file (JPG, PNG, etc.)
  - `photographerName`: Name of the photographer
  - `type`: Photo type (portrait, wedding, event, commercial, landscape, family, other)
  - `featured`: Boolean indicating if the photo is featured (true/false)
- **Response**: `201 Created`
  ```json
  {
    "photo": {
      "id": 2,
      "title": "Family Portrait",
      "description": "Professional family portrait session",
      "imageUrl": "https://res.cloudinary.com/your-cloud-name/image/upload/v1/photo-showcase/family-portrait.jpg",
      "photographerName": "Jane Photographer",
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
- **Content-Type**: `multipart/form-data`
- **Body**:
  - `title`: Photo title (optional)
  - `description`: Photo description (optional)
  - `image`: New image file (optional, JPG, PNG, etc.)
  - `photographerName`: Name of the photographer (optional)
  - `type`: Photo type (optional)
  - `featured`: Boolean indicating if the photo is featured (optional)
- **Response**: `200 OK`
  ```json
  {
    "photo": {
      "id": 2,
      "title": "Updated Family Portrait",
      "description": "Updated description for family portrait",
      "imageUrl": "https://res.cloudinary.com/your-cloud-name/image/upload/v1/photo-showcase/updated-family-portrait.jpg",
      "photographerName": "Jane Photographer",
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

### Image Upload Details

The photo upload functionality uses Cloudinary for image storage and processing:

- **Direct Upload**: Images are uploaded directly to Cloudinary without local storage
- **Size Limit**: Maximum file size is 5MB
- **Format Validation**: Only image file types are accepted (JPG, JPEG, PNG, GIF)
- **Automatic Processing**: Images are automatically resized to a maximum width of 1200px while maintaining aspect ratio
- **Storage Organization**: All images are stored in a 'photo-showcase' folder in Cloudinary
- **Resource Management**: When updating or deleting photos, the old images are automatically removed from Cloudinary

### Example Upload Using Fetch API

```javascript
// Create a FormData object
const formData = new FormData();
formData.append('title', 'Mountain Landscape');
formData.append('description', 'Beautiful mountain vista');
formData.append('image', imageFile); // File from <input type="file">
formData.append('photographerName', 'Jane Doe');
formData.append('type', 'landscape');
formData.append('featured', 'false');

// Send the request
fetch('/api/photos', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer your_jwt_token'
  },
  body: formData
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
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
        "imageUrl": "https://res.cloudinary.com/your-cloud-name/image/upload/v1/service-images/wedding-service.jpg",
        "createdAt": "2023-05-10T14:30:00.000Z",
        "updatedAt": "2023-05-10T14:30:00.000Z"
      },
      {
        "id": 2,
        "name": "Portrait Session",
        "description": "Professional portrait photography",
        "price": "250.00",
        "duration": "1-2 hours",
        "imageUrl": "https://res.cloudinary.com/your-cloud-name/image/upload/v1/service-images/portrait-service.jpg",
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
      "imageUrl": "https://res.cloudinary.com/your-cloud-name/image/upload/v1/service-images/wedding-service.jpg",
      "createdAt": "2023-05-10T14:30:00.000Z",
      "updatedAt": "2023-05-10T14:30:00.000Z"
    }
  }
  ```

#### Create Service (Admin Only)

- **URL**: `/api/services`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer jwt_token_here`
- **Content-Type**: `multipart/form-data`
- **Body**:
  - `name`: Service name
  - `description`: Service description
  - `image`: Image file for the service
  - `price`: Service price (optional)
  - `duration`: Service duration (optional)
  
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
      "imageUrl": "https://res.cloudinary.com/your-cloud-name/image/upload/v1/service-images/commercial-service.jpg",
      "createdAt": "2023-06-01T11:20:00.000Z",
      "updatedAt": "2023-06-01T11:20:00.000Z"
    }
  }
  ```

#### Update Service (Admin Only)

- **URL**: `/api/services/:id`
- **Method**: `PATCH`
- **Headers**: `Authorization: Bearer jwt_token_here`
- **Content-Type**: `multipart/form-data`
- **Body**:
  - `name`: Service name (optional)
  - `description`: Service description (optional)
  - `image`: New image file (optional)
  - `price`: Service price (optional)
  - `duration`: Service duration (optional)
  
- **Response**: `200 OK`
  ```json
  {
    "service": {
      "id": 1,
      "name": "Wedding Photography",
      "description": "Premium wedding photography services with multiple photographers",
      "price": "1500.00",
      "duration": "6-8 hours",
      "imageUrl": "https://res.cloudinary.com/your-cloud-name/image/upload/v1/service-images/updated-wedding-service.jpg",
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

### Service Image Upload Details

The service management endpoints include image upload functionality with the following features:

- **Direct Upload**: Images are uploaded directly to Cloudinary without local storage
- **Size Limit**: Maximum file size is 5MB
- **Format Validation**: Only image file types are accepted (JPG, JPEG, PNG, GIF)
- **Automatic Processing**: Images are automatically resized to a maximum width of 1200px while maintaining aspect ratio
- **Storage Organization**: All service images are stored in a dedicated 'service-images' folder in Cloudinary
- **Resource Management**: When updating or deleting services, the old images are automatically removed from Cloudinary to avoid unused resources

### Example Service Creation with Image

```javascript
// Example using fetch and FormData
async function createService() {
  const formData = new FormData();
  formData.append('name', 'Family Photography');
  formData.append('description', 'Capture your family's special moments with our professional photography service.');
  formData.append('image', document.getElementById('serviceImage').files[0]);
  formData.append('price', '350');
  formData.append('duration', '2-3 hours');

  try {
    const response = await fetch('/api/services', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer your_admin_token'
      },
      body: formData
    });
    
    const data = await response.json();
    console.log('Service created:', data);
  } catch (error) {
    console.error('Error creating service:', error);
  }
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
      "photographerId": null,
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
        "photographerId": null,
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
        "photographerId": null,
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
      "photographerId": 2,
      "additionalDetails": "Looking for wedding photography for 3 hours\n\nPhotographer note: I'll be your photographer for this session."
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
        "additionalDetails": "Looking for wedding photography for 3 hours\n\nPhotographer note: I'll be your photographer for this session.",
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
    "message": "Photographer assigned successfully",
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
        "additionalDetails": "Looking for wedding photography for 3 hours",
        "status": "confirmed",
        "clientId": 3,
        "photographerId": 2,
        "createdAt": "2023-05-20T09:15:00.000Z",
        "updatedAt": "2023-05-25T14:20:00.000Z"
      }
    ]
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
    "success": true,
    "message": "Booking status updated successfully",
    "booking": {
      "id": 1,
      "status": "completed"
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
        "role": "admin"
      },
      {
        "id": 2,
        "username": "janephotographer",
        "email": "jane@example.com",
        "role": "photographer"
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

### About Page Endpoints

#### Get About Page Content

- **URL**: `/api/about`
- **Method**: `GET`
- **Response**: `200 OK`
  ```json
  {
    "id": 1,
    "title": "About Our Photography Studio",
    "content": "Welcome to our photography studio! We are a team of passionate photographers dedicated to capturing life's most precious moments...",
    "isActive": true,
    "createdAt": "2023-06-10T08:15:00.000Z",
    "updatedAt": "2023-06-15T14:30:00.000Z"
  }
  ```

#### Create About Page Content (Admin Only)

- **URL**: `/api/about`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer jwt_token_here`
- **Body**:
  ```json
  {
    "title": "About Our Photography Studio",
    "content": "Welcome to our photography studio! We are a team of passionate photographers dedicated to capturing life's most precious moments...",
    "isActive": true
  }
  ```
- **Response**: `201 Created`
  ```json
  {
    "success": true,
    "aboutPage": {
      "id": 1,
      "title": "About Our Photography Studio",
      "content": "Welcome to our photography studio! We are a team of passionate photographers dedicated to capturing life's most precious moments...",
      "isActive": true,
      "createdAt": "2023-06-10T08:15:00.000Z",
      "updatedAt": "2023-06-10T08:15:00.000Z"
    }
  }
  ```

#### Update About Page Content (Admin Only)

- **URL**: `/api/about/:id`
- **Method**: `PATCH`
- **Headers**: `Authorization: Bearer jwt_token_here`
- **Body**:
  ```json
  {
    "title": "Updated About Our Photography Studio",
    "content": "Updated content about our photography studio and our mission...",
    "isActive": true
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "message": "About page content updated successfully",
    "aboutPage": {
      "id": 1,
      "title": "Updated About Our Photography Studio",
      "content": "Updated content about our photography studio and our mission...",
      "isActive": true,
      "createdAt": "2023-06-10T08:15:00.000Z",
      "updatedAt": "2023-06-15T14:30:00.000Z"
    }
  }
  ```

#### Delete About Page Content (Admin Only)

- **URL**: `/api/about/:id`
- **Method**: `DELETE`
- **Headers**: `Authorization: Bearer jwt_token_here`
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "message": "About page content deleted successfully"
  }
  ```

#### Get Complete About Page Data

- **URL**: `/api/about/complete`
- **Method**: `GET`
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "about": {
      "id": 1,
      "title": "About Our Photography Studio",
      "content": "Welcome to our photography studio! We are a team of passionate photographers dedicated to capturing life's most precious moments...",
      "isActive": true,
      "createdAt": "2023-06-10T08:15:00.000Z",
      "updatedAt": "2023-06-15T14:30:00.000Z"
    },
    "socialMedia": [
      {
        "id": 1,
        "platform": "Instagram",
        "url": "https://instagram.com/photostudio",
        "icon": "instagram",
        "isActive": true,
        "createdAt": "2023-06-10T08:15:00.000Z",
        "updatedAt": "2023-06-15T14:30:00.000Z"
      },
      {
        "id": 2,
        "platform": "Facebook",
        "url": "https://facebook.com/photostudio",
        "icon": "facebook",
        "isActive": true,
        "createdAt": "2023-06-10T08:15:00.000Z",
        "updatedAt": "2023-06-15T14:30:00.000Z"
      }
    ],
    "contact": {
      "id": 1,
      "email": "contact@photostudio.com",
      "phone": "555-123-4567",
      "address": "123 Photography Lane, Cameracity, PC 54321",
      "businessHours": "Monday-Friday: 9am-5pm, Saturday: 10am-3pm",
      "isActive": true,
      "createdAt": "2023-06-10T08:15:00.000Z",
      "updatedAt": "2023-06-15T14:30:00.000Z"
    }
  }
  ```

#### Get Social Media Links

- **URL**: `/api/about/social`
- **Method**: `GET`
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "count": 2,
    "socialMedia": [
      {
        "id": 1,
        "platform": "Instagram",
        "url": "https://instagram.com/photostudio",
        "icon": "instagram",
        "isActive": true,
        "createdAt": "2023-06-10T08:15:00.000Z",
        "updatedAt": "2023-06-15T14:30:00.000Z"
      },
      {
        "id": 2,
        "platform": "Facebook",
        "url": "https://facebook.com/photostudio",
        "icon": "facebook",
        "isActive": true,
        "createdAt": "2023-06-10T08:15:00.000Z",
        "updatedAt": "2023-06-15T14:30:00.000Z"
      }
    ]
  }
  ```

#### Add Social Media Link (Admin Only)

- **URL**: `/api/about/social`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer jwt_token_here`
- **Body**:
  ```json
  {
    "platform": "Twitter",
    "url": "https://twitter.com/photostudio",
    "icon": "twitter"
  }
  ```
- **Response**: `201 Created`
  ```json
  {
    "success": true,
    "message": "Social media link added successfully",
    "socialMedia": {
      "id": 3,
      "platform": "Twitter",
      "url": "https://twitter.com/photostudio",
      "icon": "twitter",
      "isActive": true,
      "createdAt": "2023-06-20T10:25:00.000Z",
      "updatedAt": "2023-06-20T10:25:00.000Z"
    }
  }
  ```

#### Update Social Media Link (Admin Only)

- **URL**: `/api/about/social/:id`
- **Method**: `PATCH`
- **Headers**: `Authorization: Bearer jwt_token_here`
- **Body**:
  ```json
  {
    "url": "https://twitter.com/newphotostudio",
    "isActive": false
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "message": "Social media link updated successfully",
    "socialMedia": {
      "id": 3,
      "platform": "Twitter",
      "url": "https://twitter.com/newphotostudio",
      "icon": "twitter",
      "isActive": false,
      "createdAt": "2023-06-20T10:25:00.000Z",
      "updatedAt": "2023-06-20T11:30:00.000Z"
    }
  }
  ```

#### Delete Social Media Link (Admin Only)

- **URL**: `/api/about/social/:id`
- **Method**: `DELETE`
- **Headers**: `Authorization: Bearer jwt_token_here`
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "message": "Social media link deleted successfully"
  }
  ```

#### Get Contact Information

- **URL**: `/api/about/contact`
- **Method**: `GET`
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "contactInfo": {
      "id": 1,
      "email": "contact@photostudio.com",
      "phone": "555-123-4567",
      "address": "123 Photography Lane, Cameracity, PC 54321",
      "businessHours": "Monday-Friday: 9am-5pm, Saturday: 10am-3pm",
      "isActive": true,
      "createdAt": "2023-06-10T08:15:00.000Z",
      "updatedAt": "2023-06-15T14:30:00.000Z"
    }
  }
  ```

#### Create Contact Information (Admin Only)

- **URL**: `/api/about/contact`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer jwt_token_here`
- **Body**:
  ```json
  {
    "email": "contact@photostudio.com",
    "phone": "555-123-4567",
    "address": "123 Photography Lane, Cameracity, PC 54321",
    "businessHours": "Monday-Friday: 9am-5pm, Saturday: 10am-3pm",
    "makeActive": true
  }
  ```
- **Response**: `201 Created`
  ```json
  {
    "success": true,
    "message": "Contact information created successfully",
    "contactInfo": {
      "id": 1,
      "email": "contact@photostudio.com",
      "phone": "555-123-4567",
      "address": "123 Photography Lane, Cameracity, PC 54321",
      "businessHours": "Monday-Friday: 9am-5pm, Saturday: 10am-3pm",
      "isActive": true,
      "createdAt": "2023-06-10T08:15:00.000Z",
      "updatedAt": "2023-06-10T08:15:00.000Z"
    }
  }
  ```

#### Update Contact Information (Admin Only)

- **URL**: `/api/about/contact/:id`
- **Method**: `PATCH`
- **Headers**: `Authorization: Bearer jwt_token_here`
- **Body**:
  ```json
  {
    "email": "newcontact@photostudio.com",
    "businessHours": "Monday-Friday: 9am-6pm, Saturday: 10am-4pm",
    "makeActive": true
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "message": "Contact information updated successfully",
    "contactInfo": {
      "id": 1,
      "email": "newcontact@photostudio.com",
      "phone": "555-123-4567",
      "address": "123 Photography Lane, Cameracity, PC 54321",
      "businessHours": "Monday-Friday: 9am-6pm, Saturday: 10am-4pm",
      "isActive": true,
      "createdAt": "2023-06-10T08:15:00.000Z",
      "updatedAt": "2023-06-20T11:45:00.000Z"
    }
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
- photographerName: STRING
- type: ENUM ('portrait', 'wedding', 'event', 'commercial', 'landscape', 'family', 'other')
- featured: BOOLEAN
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

### AboutContent

- id: INT (Primary Key)
- title: STRING
- content: TEXT
- isActive: BOOLEAN
- createdAt: DATE
- updatedAt: DATE

### SocialMedia

- id: INT (Primary Key)
- platform: STRING
- url: STRING
- icon: STRING
- isActive: BOOLEAN
- createdAt: DATE
- updatedAt: DATE

### ContactInfo

- id: INT (Primary Key)
- email: STRING
- phone: STRING
- address: TEXT
- businessHours: TEXT
- isActive: BOOLEAN
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

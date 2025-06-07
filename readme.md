# Photo Showcase API

A RESTful API for a photographer's portfolio and gallery management system.

## Features

- Photo gallery with filtering by type and featured status
- User authentication with JWT
- Role-based access control (admin vs regular users)
- Direct image uploads to Cloudinary
- Comprehensive API documentation with Swagger
- Full CRUD operations for photo management

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn
- PostgreSQL or MySQL database
- Cloudinary account

### Installation

1. Clone the repository
2. Install dependencies
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   # Database
   DB_HOST=localhost
   DB_USER=yourusername
   DB_PASS=yourpassword
   DB_NAME=photoshowcase

   # JWT
   JWT_SECRET=your-secret-key
   JWT_LIFETIME=1d

   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```
4. Run database migrations
   ```bash
   npm run migrate
   ```
5. Start the server
   ```bash
   npm start
   ```

## API Documentation

Access the Swagger documentation at `/api-docs` when the server is running.

## Photo Upload

The API supports direct image uploads to Cloudinary. When creating or updating photos, send a multipart/form-data request with the following fields:

- `title`: Photo title
- `description`: Photo description
- `image`: The image file to upload
- `photographerName`: Name of the photographer
- `type`: Photo type (portrait, wedding, event, commercial, landscape, family, or other)
- `featured`: Boolean indicating if the photo is featured

Example using fetch:

```javascript
const formData = new FormData();
formData.append('title', 'Mountain Sunset');
formData.append('description', 'Beautiful sunset in the mountains');
formData.append('image', imageFile); // File object from input
formData.append('photographerName', 'John Doe');
formData.append('type', 'landscape');
formData.append('featured', 'true');

fetch('/api/photos', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer your-token-here'
  },
  body: formData
})
.then(response => response.json())
.then(data => console.log(data));
```

## Image Processing

Images uploaded to Cloudinary are automatically:
- Stored in a 'photo-showcase' folder
- Resized to a maximum width of 1200px while maintaining aspect ratio
- Limited to 5MB in size
- Validated to ensure they're actual image files

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token

### Photos
- `GET /api/photos` - Get all photos (with optional filtering)
- `GET /api/photos/gallery` - Get photos for gallery display
- `GET /api/photos/:id` - Get a specific photo by ID
- `POST /api/photos` - Add a new photo (admin only)
- `PATCH /api/photos/:id` - Update a photo (admin only)
- `DELETE /api/photos/:id` - Delete a photo (admin only)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

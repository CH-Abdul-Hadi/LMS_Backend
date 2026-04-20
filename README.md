# LMS Backend

A Learning Management System Backend API built with Node.js, Express, and MongoDB.

## Features

- **User Authentication** with JWT tokens and refresh tokens
- **Role-based Access Control** (Instructor, Student)
- **Course Management** with thumbnail uploads
- **Lesson Management** with video and thumbnail uploads
- **File Upload Support** using Multer
- **Cloudinary Integration** for media storage

## Tech Stack

- **Node.js** + **Express.js** (ES Modules)
- **MongoDB** with **Mongoose** ODM
- **JWT** for authentication
- **Multer** for file uploads
- **Cloudinary** for cloud storage
- **bcrypt** for password hashing
- **dotenv** for environment variables

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env_sample`:
   ```bash
   cp .env_sample .env
   ```

4. Update the `.env` file with your configuration

## Environment Variables

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
CORS_ORIGIN=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Authentication (`/api/v1/auth`)
- `GET /login` - User login
- `GET /logout` - User logout
- `GET /signup` - User registration
- `GET /refresh-token` - Refresh access token

### User (`/api/v1/user`)
- `GET /me` - Get current user information

### Courses (`/api/v1/course`)
- `GET /` - Get all courses (Instructor/Student)
- `POST /` - Create course (Instructor only)
  - Requires `thumbnail` (image file, max 5MB)
- `GET /:id` - Get course by ID (Instructor/Student)
- `PATCH /:id` - Update course (Instructor only)
- `PATCH /toggle-status/:id` - Toggle course status

### Lessons (`/api/v1/lesson`)
- `GET /` - Get lessons by course (Instructor/Student)
- `POST /` - Create lesson (Instructor only)
  - Requires `video` (video file, max 50MB)
  - Requires `thumbnail` (image file)
- `PATCH /:id` - Update lesson (Instructor only)
- `PATCH /toggle-status/:id` - Toggle lesson status

## Authentication

All endpoints (except health check) require JWT authentication. The API uses:

- **Access Tokens**: Short-lived tokens for API access
- **Refresh Tokens**: Long-lived tokens for refreshing access tokens
- **Cookie-based Authentication**: Tokens are stored in HTTP-only cookies

## File Uploads

### Course Thumbnails
- Format: Image files only
- Max size: 5MB
- Stored on Cloudinary

### Lesson Videos
- Format: Video files only
- Max size: 50MB
- Stored on Cloudinary

### Lesson Thumbnails
- Format: Image files only
- Stored on Cloudinary

## Role-based Permissions

- **Instructor**: Can create, update, and manage courses and lessons
- **Student**: Can view courses and lessons
- **All authenticated users**: Can access user profile and authentication endpoints

## Postman Collection

A Postman collection is included in the repository (`postman-collection.json`). Import it into Postman to test all API endpoints.

## Database Schema

### User
- Email, password, role (Instructor/Student)
- Profile information

### Course
- Title, description, thumbnail
- Status (active/inactive)
- Created by Instructor

### Lesson
- Title, description, video, thumbnail
- Associated with Course
- Status (active/inactive)

## Error Handling

The API uses a standardized error response format:
```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

ISC License

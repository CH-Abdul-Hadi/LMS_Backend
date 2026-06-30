# LMS Backend

A Learning Management System Backend API built with Node.js, Express, and MongoDB.

## Features

- **User Authentication** with JWT tokens and refresh tokens
- **Role-based Access Control** (Instructor, Student)
- **Course Management** with thumbnail uploads
- **Lesson Management** with video and thumbnail uploads
- **Course Enrollment & Progress Tracking** for students
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

4. Update the `.env` file with your configuration.
> **Note**: If you face an `ECONNREFUSED` error during MongoDB connection using `mongodb+srv://`, replace it with the standard `mongodb://` replica set connection string, as some ISPs block SRV DNS lookups.

## Environment Variables

```env
PORT=3000
MONGODB_URL=your_mongodb_connection_string
DB_NAME=lms_db
CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret

# Optional SMTP settings (falls back to mock emails if omitted)
EMAIL_HOST=your_smtp_host
EMAIL_PORT=your_smtp_port
EMAIL_USER=your_smtp_user
EMAIL_PASS=your_smtp_password
EMAIL_FROM_NAME=LMS
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
- `POST /login` - User login
- `POST /logout` - User logout
- `POST /signup` - User registration
- `POST /refresh-token` - Refresh access token
- `POST /forgot-password` - Request password reset link
- `POST /reset-password` - Reset password using token

### User (`/api/v1/user`)
- `GET /me` - Get current user information
- `PATCH /update-profile` - Update username or email
- `PATCH /change-password` - Change user password
- `PATCH /update-avatar` - Update profile picture (Requires `avatar` image file)

### Courses (`/api/v1/course`)
- `GET /` - Get all courses (Instructor/Student)
- `GET /my` - Get courses created by the current instructor (Instructor only)
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

### Enrollments (`/api/v1/enrollment`)
- `POST /` - Enroll in a course (Student only)
- `GET /my` - Get all enrollments for the current student (Student only)
- `PATCH /progress` - Update lesson progress in a course (Student only)
- `DELETE /:courseId` - Unenroll from a course (Student only)
- `GET /course/:courseId` - Get all students enrolled in a specific course (Instructor only)

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

- **Instructor**: Can create, update, and manage courses, lessons, and view course enrollments
- **Student**: Can view courses, lessons, enroll, and track progress
- **All authenticated users**: Can access user profile, update details, and manage authentication

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

### Enrollment
- Student ID, Course ID
- Progress percentage
- Array of completed lessons

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

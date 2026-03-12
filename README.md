# Smart Task & Team Management System

A comprehensive web application for managing tasks, projects, and team collaboration built with Flask (backend) and React (frontend).

## Features

- **User Authentication**: Secure login and registration with JWT tokens
- **Project Management**: Create, update, and manage projects with team members
- **Task Management**: Create, assign, and track tasks within projects
- **Team Collaboration**: Add comments and attachments to tasks
- **Analytics Dashboard**: View project and task analytics (admin feature)
- **File Uploads**: Attach files to tasks and comments
- **Responsive Design**: Modern UI built with React and Tailwind CSS

## Tech Stack

### Backend
- **Flask**: Python web framework
- **SQLAlchemy**: ORM for database operations
- **Flask-JWT-Extended**: JWT authentication
- **Flask-CORS**: Cross-origin resource sharing
- **PyMySQL**: MySQL database connector

### Frontend
- **React**: JavaScript library for building user interfaces
- **Vite**: Fast build tool and development server
- **React Router**: Client-side routing
- **Axios**: HTTP client for API requests
- **Tailwind CSS**: Utility-first CSS framework
- **Recharts**: Chart library for analytics

## Prerequisites

- Python 3.8 or higher
- Node.js 16 or higher
- MySQL database
- Git

## Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd "Smart Task & Team Management System"
   ```

2. **Backend Setup:**

   a. Navigate to the backend directory:
   ```bash
   cd backend
   ```

   b. Create and activate virtual environment:
   ```bash
   python -m venv myvenv
   myvenv\Scripts\activate  # On Windows
   # source myvenv/bin/activate  # On macOS/Linux
   ```

   c. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

   d. Set up environment variables:
   Create a `.env` file in the backend directory with:
   ```
   SECRET_KEY=your-secret-key-here
   JWT_SECRET_KEY=your-jwt-secret-key-here
   DATABASE_URL=mysql+pymysql://username:password@localhost/db_name
   ```

   e. Initialize the database:
   ```bash
   python seed_admin.py
   ```

3. **Frontend Setup:**

   a. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```

   b. Install Node.js dependencies:
   ```bash
   npm install
   ```

## Running the Application

### Development Mode

1. **Start the Backend:**
   ```bash
   cd backend
   myvenv\Scripts\activate  # Activate virtual environment
   python app.py
   ```
   The backend will run on `http://localhost:5000`

2. **Start the Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`

### Using Batch Files (Windows)

For convenience, you can use the provided batch files:

- `start-backend.bat`: Starts the Flask backend
- `start-frontend.bat`: Starts the React frontend

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/<id>` - Get project details
- `PUT /api/projects/<id>` - Update project
- `DELETE /api/projects/<id>` - Delete project

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create new task
- `GET /api/tasks/<id>` - Get task details
- `PUT /api/tasks/<id>` - Update task
- `DELETE /api/tasks/<id>` - Delete task

### Comments
- `GET /api/tasks/<task_id>/comments` - Get task comments
- `POST /api/tasks/<task_id>/comments` - Add comment to task

### Analytics (Admin only)
- `GET /api/analytics/overview` - Get system analytics

## Project Structure

```
Smart Task & Team Management System/
├── backend/
│   ├── app.py                 # Main Flask application
│   ├── config.py              # Configuration settings
│   ├── requirements.txt       # Python dependencies
│   ├── models/                # Database models
│   ├── controllers/           # Business logic controllers
│   ├── routes/                # API route definitions
│   ├── middleware/            # Authentication middleware
│   ├── utils/                 # Utility functions
│   └── uploads/               # File upload directory
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/             # Page components
│   │   ├── context/           # React context providers
│   │   ├── services/          # API service functions
│   │   └── assets/            # Static assets
│   ├── package.json           # Node.js dependencies
│   └── vite.config.js         # Vite configuration
├── start-backend.bat          # Backend startup script
├── start-frontend.bat         # Frontend startup script
└── .gitignore                 # Git ignore rules
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions, please open an issue on the GitHub repository.
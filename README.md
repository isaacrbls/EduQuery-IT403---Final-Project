# EduQuery - Survey Management System

A comprehensive Django-based survey management system for educational institutions, allowing teachers to create surveys and students to respond.

## 🚀 Quick Start (Windows)

### 1. Activate Virtual Environment
```cmd
venv\Scripts\activate
```

### 2. Install Dependencies
```cmd
pip install -r requirements.txt
```

### 3. Setup Database (One Command!)
```cmd
python setup_db.py
```
This single script:
- Creates all database tables
- Creates admin, teachers, and students
- Creates sections with enrolled students
- Creates 3 sample surveys with questions
- Generates activity logs

### 4. Start the Server
```cmd
python manage.py runserver
```

### 5. Access the Application
- **Main App:** http://127.0.0.1:8000/
- **Admin Panel:** http://127.0.0.1:8000/admin/
- **API:** http://127.0.0.1:8000/api/

## 🔑 Default Login Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Teacher | teacher1 | teacher123 |
| Student | student1 | student123 |

## 📋 Features

### For Teachers:
- Create and manage surveys
- Multiple question types (Multiple Choice, Likert Scale, Checkboxes, Text, etc.)
- Assign surveys to sections
- View and analyze responses
- Track survey statistics
- Drag-and-drop question reordering

### For Students:
- View assigned surveys
- Submit responses
- Track submission history
- View results (if allowed by teacher)

### For Admins:
- Full system access
- Manage users, sections, surveys
- View all activities
- System configuration

## 📁 Project Structure

```
EduQuery/
├── accounts/           # User management and authentication
├── surveys/           # Survey and question models
├── responses/         # Survey response handling
├── analytics/         # Activity logging and analytics
├── templates/         # HTML templates
├── static/           # CSS, JavaScript, images
├── eduquery/         # Project settings
├── setup_db.py       # Complete database setup script
├── verify_setup.py   # Verify database setup
└── requirements.txt  # Python dependencies
```

## 🗄️ Sample Data

The `setup_db.py` script creates:
- **1 Admin account** - Full system access
- **2 Teacher accounts** - Can create surveys
- **10 Student accounts** - Can take surveys
- **2 Sections** - IT403-A and IT301-B
- **3 Sample Surveys:**
  1. Student Satisfaction Survey (5 questions, Published)
  2. Course Feedback - IT 403 (5 questions, Published)
  3. Quick Poll - Learning Preferences (3 questions, Draft)

## 🛠️ Technologies Used

- **Backend:** Django 5.2.7
- **API:** Django REST Framework 3.16.1
- **Database:** SQLite (Development)
- **Frontend:** Bootstrap 5.3.0, Vanilla JavaScript
- **Icons:** Bootstrap Icons, Material Icons
- **Other:** Pillow, Django CORS Headers

## 📚 Documentation

- **[SETUP GUIDE [PAKI-BASA].md](SETUP%20GUIDE%20%5BPAKI-BASA%5D.md)** - Complete Windows setup guide
- **verify_setup.py** - Check database status
- **setup_db.py** - Database initialization script

## 🔧 Common Commands

### Activate Virtual Environment:
```cmd
venv\Scripts\activate
```

### Start Server:
```cmd
python manage.py runserver
```

### Verify Setup:
```cmd
python verify_setup.py
```

### Check for Issues:
```cmd
python manage.py check
```

### Reset Database:
```cmd
del db.sqlite3
python setup_db.py
```

## 📝 Question Types Supported

1. **Multiple Choice** - Single selection from options
2. **Checkbox** - Multiple selections from options
3. **Likert Scale** - Agreement/satisfaction ratings
4. **Short Answer** - Brief text responses
5. **Long Answer** - Detailed text responses

## 🎯 Key Features

- ✅ Complete survey builder with inline question creation
- ✅ Drag-and-drop question reordering
- ✅ Real-time preview of questions
- ✅ Batch question creation (add multiple questions then save all)
- ✅ Survey versioning and status management
- ✅ Anonymous and identified survey options
- ✅ Section-based survey assignment
- ✅ Response tracking and analytics
- ✅ Activity logging for audit trails

## 🔐 Security Features

- User authentication and authorization
- Role-based access control (Admin, Teacher, Student)
- CSRF protection
- Secure password handling
- Anonymous survey options

## 📊 Database Models

- **User** - Custom user model with roles
- **Section** - Class sections with enrolled students
- **Survey** - Survey configuration and metadata
- **Question** - Survey questions with various types
- **Response** - Student survey submissions
- **Answer** - Individual question answers
- **ActivityLog** - System activity tracking

## 🤝 Contributing

This is an educational project for IT403 - Information Systems course.

## 📄 License

Educational project - All rights reserved.

## 👥 Authors

IT403 Final Project Team

---

**For detailed setup instructions, see [SETUP GUIDE [PAKI-BASA].md](SETUP%20GUIDE%20%5BPAKI-BASA%5D.md)**

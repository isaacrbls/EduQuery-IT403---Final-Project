# EduQuery Setup Guide (Windows)

Complete guide for setting up and running the EduQuery application on Windows.

---

## Prerequisites

Before starting, make sure you have:
- Python 3.8 or higher installed
- Git installed (optional, if cloning from repository)

---

## Step 1: Activate Virtual Environment

The virtual environment is already created as `venv` or `.venv`.

### On Windows (Command Prompt):
```cmd
venv\Scripts\activate
```

### On Windows (PowerShell):
```powershell
venv\Scripts\Activate.ps1
```

**OR if using `.venv`:**

### Command Prompt:
```cmd
.venv\Scripts\activate
```

### PowerShell:
```powershell
.venv\Scripts\Activate.ps1
```

**You should see `(venv)` or `(.venv)` at the start of your command prompt.**

---

## Step 2: Install Dependencies

With the virtual environment activated, install all required packages:

```cmd
pip install -r requirements.txt
```

**If you encounter errors:**
```cmd
python -m pip install --upgrade pip
pip install -r requirements.txt
```

**Installed packages include:**
- Django 5.2.7
- Django REST Framework
- Pillow (for image handling)
- Django CORS Headers
- Django Tailwind

---

## Step 3: Complete Database Setup

**This single script does EVERYTHING:**
- Creates database tables (runs migrations)
- Creates admin user
- Creates 2 teachers and 10 students
- Creates 2 sections with enrolled students
- Creates 3 sample surveys with various question types
- Generates activity logs

**Simply run:**
```cmd
python setup_db.py
```

**Expected output:**
```
==============================================================
               EDUQUERY DATABASE SETUP
==============================================================

STEP 1: Running Database Migrations
✓ All migrations applied successfully

STEP 2: Creating Users
✓ Created superuser: admin / admin123
✓ Created teacher: teacher1 / teacher123
✓ Created teacher: teacher2 / teacher123
✓ Created student: student1 / student123
... (more students)

STEP 3: Creating Sections
✓ Created section: IT 403 (IT403-A)
✓ Created section: IT 301 (IT301-B)

STEP 4: Creating Sample Surveys
✓ Created survey: 'Student Satisfaction Survey'
✓ Created survey: 'Course Feedback - IT 403'
✓ Created survey: 'Quick Poll - Learning Preferences'

==============================================================
                   SETUP COMPLETE!
==============================================================
```

**That's it! Your database is fully set up with:**
- ✅ Database tables created
- ✅ 1 Admin account
- ✅ 2 Teacher accounts
- ✅ 10 Student accounts
- ✅ 2 Sections with enrolled students
- ✅ 3 Sample surveys with questions
- ✅ Activity logs

---

## Step 4: Verify Setup (Optional)

To verify everything is set up correctly:

```cmd
python verify_setup.py
```

**You should see:**
```
📊 USERS:
   Total: 13
   ├─ Admins: 1
   ├─ Teachers: 2
   └─ Students: 10

📚 SECTIONS:
   Total: 2
   ├─ IT403-A: 5 students
   ├─ IT301-B: 5 students

📋 SURVEYS:
   Total: 3
   ├─ "Student Satisfaction Survey"
   ├─ "Course Feedback - IT 403"
   └─ "Quick Poll - Learning Preferences"

✅ ALL CHECKS PASSED - DATABASE IS READY!
```

---

## Step 5: Start the Development Server

```cmd
python manage.py runserver
```

**You should see:**
```
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-BREAK.
```

**The server is now running!** Keep this terminal window open.

---

## Step 6: Access the Application

### Main Application URLs:

| Page | URL |
|------|-----|
| **Landing Page** | http://127.0.0.1:8000/ |
| **Login** | http://127.0.0.1:8000/login/ |
| **Signup** | http://127.0.0.1:8000/signup/ |
| **Student Dashboard** | http://127.0.0.1:8000/student/dashboard/ |
| **Teacher Dashboard** | http://127.0.0.1:8000/teacher/dashboard/ |
| **Profile** | http://127.0.0.1:8000/profile/ |

### Admin Panel:
| Page | URL |
|------|-----|
| **Django Admin** | http://127.0.0.1:8000/admin/ |

Use this to manage database records directly (users, surveys, questions, etc.)

### API Endpoints:
| Endpoint | URL |
|----------|-----|
| **API Root** | http://127.0.0.1:8000/api/ |
| **Surveys API** | http://127.0.0.1:8000/api/surveys/ |
| **Accounts API** | http://127.0.0.1:8000/api/accounts/ |

---

## Login Credentials

All accounts use simple passwords for development:

| Role | Username | Password | Description |
|------|----------|----------|-------------|
| **Admin** | admin | admin123 | Full system access |
| **Teacher** | teacher1 | teacher123 | Can create/manage surveys |
| **Teacher** | teacher2 | teacher123 | Can create/manage surveys |
| **Student** | student1 | student123 | Can take surveys |
| **Student** | student2 | student123 | Can take surveys |
| **Student** | student3 | student123 | Can take surveys |
| ... | ... | student123 | (students 4-10) |

**All student IDs follow the format:** `2024-0001`, `2024-0002`, etc.

---

## Sample Data Included

### Users:
- **1 Admin** - Full system access
- **2 Teachers** - Can create and manage surveys
- **10 Students** - Can take surveys and view results

### Sections:
1. **IT 403 (IT403-A)** - Information Systems
   - Teacher: teacher1
   - Students: student1 through student5

2. **IT 301 (IT301-B)** - Database Systems
   - Teacher: teacher2
   - Students: student6 through student10

### Surveys:

1. **Student Satisfaction Survey** (Published & Active)
   - Questions: 5
   - Types: Short answer, multiple choice, Likert scale, checkbox, long answer
   - Assigned to: IT403-A
   - Anonymous: No

2. **Course Feedback - IT 403** (Published & Active)
   - Questions: 5
   - Types: Likert scales, multiple choice, checkbox, long answer
   - Assigned to: IT403-A
   - Anonymous: Yes

3. **Quick Poll - Learning Preferences** (Draft)
   - Questions: 3
   - Types: Multiple choice, checkbox, Likert scale
   - Assigned to: Both sections
   - Anonymous: Yes
   - Status: Not yet active

---

## Troubleshooting

### Issue: Virtual environment won't activate
**Solution:**
- Make sure you're in the project directory
- Try using full path: `C:\path\to\project\venv\Scripts\activate`
- On PowerShell, you may need to run: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

### Issue: "pip" command not found
**Solution:**
```cmd
python -m pip install -r requirements.txt
```

### Issue: Database errors or missing tables
**Solution:**
1. Delete `db.sqlite3` if it exists
2. Run `python setup_db.py` again

### Issue: Port 8000 already in use
**Solution:**
```cmd
python manage.py runserver 8001
```
(Use a different port number)

### Issue: Import errors
**Solution:**
Make sure virtual environment is activated (you should see `(venv)` in prompt)

---

## Common Commands

### Activate virtual environment:
```cmd
venv\Scripts\activate
```

### Start server:
```cmd
python manage.py runserver
```

### Create new admin user:
```cmd
python manage.py createsuperuser
```

### Check for issues:
```cmd
python manage.py check
```

### View all URLs:
```cmd
python manage.py show_urls
```

### Reset database (if needed):
```cmd
del db.sqlite3
python setup_db.py
```

---

## What's Next?

1. **Explore the Admin Panel:**
   - Go to http://127.0.0.1:8000/admin/
   - Login as: admin / admin123
   - Browse users, surveys, questions, responses

2. **Test as Teacher:**
   - Login as: teacher1 / teacher123
   - Access teacher dashboard
   - Create new surveys
   - View responses

3. **Test as Student:**
   - Login as: student1 / student123
   - View assigned surveys
   - Take surveys
   - View your responses

4. **Develop Features:**
   - All code is in the project folders
   - Templates in: `templates/`
   - Static files in: `static/`
   - Django apps in: `accounts/`, `surveys/`, `responses/`, `analytics/`

---

## Need Help?

- Check `verify_setup.py` output for database status
- Review Django error messages in terminal
- Check browser console for JavaScript errors
- Ensure virtual environment is activated before running commands

---

**Happy Coding! 🎉**
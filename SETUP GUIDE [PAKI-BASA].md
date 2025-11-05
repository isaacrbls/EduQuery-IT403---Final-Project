## Django Backend Setup


### Step 1: Activate Virtual Environment

**The virtual environment is already created as `.venv`**


**On Windows (Command Prompt):**
```cmd
.venv\Scripts\activate
```

**On Windows (PowerShell):**
```powershell
.venv\Scripts\Activate.ps1
```

**You should see `(.venv)` at the start of your terminal prompt**

---

### Step 3: Install Python Dependencies (If Needed)

```bash
# Make sure virtual environment is activated (.venv)
pip install -r requirements.txt
```

**If you see errors, try:**
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

**Note:** Dependencies are likely already installed. Skip this if the next steps work.

---

### Step 4: Set Up Database (If Not Already Done)

**Check if database exists:**
```bash
ls db.sqlite3
```

If the file doesn't exist, run:
```bash
# Apply migrations
python manage.py migrate

# Create sample data
python setup_db.py
```

---

### Step 5: Verify Django Setup

```bash
# Run verification script
python verify_setup.py
```

You should see:
- ✓ Users: 13
- ✓ Sections: 2
- ✓ Surveys: 1
- ✓ All checks passed

---

### Step 6: Start Django Development Server

```bash
# Activate virtual environment
source .venv/bin/activate

# Run the development server
python manage.py runserver
```

You should see:
```
Starting development server at http://127.0.0.1:8000/
```

**The server is now running!** 

---

## Access the Application

### Main Application (Django Templates):
**URL:** http://127.0.0.1:8000/

This is your main application where users will interact.

**Key URLs:**
- Landing Page: http://127.0.0.1:8000/
- Login: http://127.0.0.1:8000/login/
- Signup: http://127.0.0.1:8000/signup/
- Student Dashboard: http://127.0.0.1:8000/student/dashboard/
- Survey List: http://127.0.0.1:8000/surveys/
- Profile: http://127.0.0.1:8000/profile/

### Django Admin Panel:
**URL:** http://127.0.0.1:8000/admin/
- Username: `admin`
- Password: `admin123`

Use this to manage data directly.

### Django API:
**URL:** http://127.0.0.1:8000/api/

API endpoints for programmatic access.


---

## Login Credentials

| Role | Username | Password | Description |
|------|----------|----------|-------------|
| Admin | admin | admin123 | Full access to everything |
| Teacher | teacher1 | teacher123 | Can create surveys |
| Teacher | teacher2 | teacher123 | Can create surveys |
| Student | student1 | student123 | Can take surveys |
| Student | student2 | student123 | Can take surveys |
| ... | student3-10 | student123 | More test accounts |

---
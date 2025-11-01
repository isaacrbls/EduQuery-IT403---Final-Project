
## Prerequisites

Before starting, make sure you have installed:
- Python 3.8 or higher
- Node.js 16 or higher
- npm (comes with Node.js)

---

## Part 1: Django Backend Setup

### Step 1: Create Virtual Environment

```bash
# Create virtual environment
python -m venv venv

# OR on some systems
python3 -m venv venv
```

---

### Step 2: Activate Virtual Environment

**On Windows (Command Prompt):**
```cmd
venv\Scripts\activate
```
**You should see `(venv)` at the start of your terminal prompt**

---

### Step 3: Install Python Dependencies

```bash
# Make sure virtual environment is activated (venv)
pip install -r requirements.txt
```

**If you see errors, try:**
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

---

### Step 4: Set Up Database

**Use the Automated Script:**
```bash
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

### Step 6: Start Django Backend Server

```bash
python manage.py runserver
```

You should see:
```
Starting development server at http://127.0.0.1:8000/
```

**Keep this terminal running!** Django backend runs on port 8000.

---

## Part 2: React Frontend Setup

### Step 7: Open a NEW Terminal

**Important:** Keep the Django server running in the first terminal.
Open a **second terminal** for the React frontend.

---

### Step 8: Navigate to Frontend Directory

```bash
cd frontend
```

---

### Step 9: Install Node.js Dependencies

```bash
npm install
```
---

### Step 10: Start React Development Server

```bash
npm run dev
```

You should see:
```
➜  Local:   http://localhost:5173/
```

**Keep this terminal running too!**

---

## Access the Application

### React Frontend (Main Application):
**URL:** http://localhost:5173

This is your main application where users will interact.

### Django Admin Panel:
**URL:** http://127.0.0.1:8000/admin/
- Username: `admin`
- Password: `admin123`

Use this to manage data directly.

### Django API:
**URL:** http://127.0.0.1:8000/api/


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

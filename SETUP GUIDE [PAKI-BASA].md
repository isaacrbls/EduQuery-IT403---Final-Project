Create Virtual Environment

```bash
# Create virtual environment
python -m venv venv

# OR on some systems
python3 -m venv venv
```

---

Activate Virtual Environment

**On Windows (Command Prompt):**
```cmd
venv\Scripts\activate
```
**You should see `(venv)` at the start of your terminal prompt**

---

Install Dependencies

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

**Set Up Database**

**Use the Automated Script**
```bash
python setup_db.py
```

---

Verify Setup

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

Run the Development Server

```bash
python manage.py runserver
```

You should see:
```
Starting development server at http://127.0.0.1:8000/
```

---
Access the Application

Open your browser and visit:

**Admin Panel:**
- URL: http://127.0.0.1:8000/admin/
- Username: `admin`
- Password: `admin123`

**Main Application:**
- URL: http://127.0.0.1:8000/

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



# EduQuery - Survey Platform

A modern survey platform for educational institutions built with Django, Bootstrap, and Tailwind CSS.

## Project Structure

```
EduQuery/
├── accounts/           # User authentication and profile management
├── surveys/           # Survey creation and management (Survey Builder)
├── responses/         # Response viewing and management
├── analytics/         # Analytics dashboard with charts
├── templates/         # HTML templates
│   ├── accounts/
│   ├── surveys/
│   ├── responses/
│   ├── analytics/
│   ├── components/   # Reusable UI components
│   └── base.html     # Base template with Bootstrap & Tailwind
├── static/           # Static files (CSS, JS, images)
│   ├── css/
│   ├── js/
│   └── images/
├── eduquery/         # Main project settings
└── manage.py
```

## Technology Stack

### Backend
- **Django 5.2.7** - Web framework (MTV pattern)
- **Django REST Framework** - API development
- **SQLite** - Database (perfect for development and school projects)

### Frontend
- **HTML5** - Markup
- **Bootstrap 5.3** - CSS framework
- **Tailwind CSS** - Utility-first CSS
- **jQuery 3.7** - JavaScript library
- **jQuery UI** - Drag-and-drop, datepickers, autocomplete
- **Chart.js** - Data visualization
- **Font Awesome** - Icons

## Setup Instructions

### 1. Virtual Environment (Already Created)
```bash
source venv/bin/activate  # Activate virtual environment
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Run Migrations (When ready)
```bash
python manage.py makemigrations
python manage.py migrate
```

### 4. Create Superuser
```bash
python manage.py createsuperuser
```

### 5. Run Development Server
```bash
python manage.py runserver
```

Visit: http://127.0.0.1:8000/

## Django Apps

### 1. **accounts** - User Management
- Sign-up / Login
- User profiles
- Authentication

### 2. **surveys** - Survey Builder (David Mark T. Idio)
- Create/Edit surveys
- Drag-and-drop question builder
- Survey assignment to sections
- Due dates management

### 3. **responses** - Response Viewer (Mark Deniel B. Santos)
- View student submissions
- Paginated, sortable tables
- Search and filter features
- Response history

### 4. **analytics** - Analytics Dashboard (John Jasper C. Narvasa)
- Pie charts for MCQ
- Bar charts for Likert scale
- Word clouds for text answers
- Survey summary statistics

## Key Features

### For Students (Robles – Core Logic)
- View assigned surveys
- Take surveys (MCQ, Likert, text responses)
- Progress tracking
- One-time submission enforcement
- Response history

### For Teachers/Admin
- Create and manage surveys
- Assign surveys to sections
- View all responses
- Analytics and visualizations
- Export data

### UI/UX (Khyzyl Zam Macapagal)
- Responsive design
- Reusable components
- Consistent styling
- Interactive elements with jQuery UI

## API Endpoints

### Surveys
- `POST /surveys/api/questions/create/` - Create question
- `PUT /surveys/api/questions/<id>/update/` - Update question
- `DELETE /surveys/api/questions/<id>/delete/` - Delete question

### Responses
- `GET /responses/api/survey/<id>/filter/` - Filter responses
- `GET /responses/api/survey/<id>/export/` - Export responses

### Analytics
- `GET /analytics/api/survey/<id>/mcq-data/` - MCQ chart data
- `GET /analytics/api/survey/<id>/likert-data/` - Likert chart data
- `GET /analytics/api/survey/<id>/text-data/` - Text response data
- `GET /analytics/api/survey/<id>/summary/` - Survey summary

## Next Steps

1. **Create Django models** for:
   - User profiles (Student/Teacher)
   - Surveys and Questions
   - Survey assignments
   - Student responses
   - Sections/Classes
3. **Implement views and APIs**
4. **Create HTML templates** for each screen
5. **Add form validation and security**
6. **Implement chart logic** with Chart.js
7. **Testing and deployment**

## Team Responsibilities

- **Robles**: Core logic, student survey engine, response models
- **Khyzyl Zam Macapagal**: UI/UX design, styling, components
- **David Mark T. Idio**: Survey builder, drag-and-drop interface
- **Mark Deniel B. Santos**: Response viewer, filtering, tables
- **John Jasper C. Narvasa**: Analytics dashboard, charts

## Notes

- Database is SQLite - perfect for development and school projects
- Static files are served from `/static/` directory
- Templates use Django's MTV pattern
- REST API is available at `/api/`
- Admin panel: http://127.0.0.1:8000/admin/

---

**IT403 Final Project - 2025**


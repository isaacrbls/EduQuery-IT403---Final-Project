# EduQuery - AI Agent Instructions

## Project Overview
EduQuery is a Django-based educational survey management system with role-based access for teachers, students, and admins. Teachers create surveys, students respond, and the system provides analytics on survey responses.

## Architecture & Core Patterns

### Four-App Django Structure
The project follows a modular Django architecture with clear boundaries:
- **`accounts/`** - Custom user model, authentication, sections (classes), role-based views
- **`surveys/`** - Survey/Question models, builder views, question types (MCQ, Likert, checkboxes, text)
- **`responses/`** - Response/Answer models, submission tracking, viewing response data
- **`analytics/`** - Activity logging (`ActivityLog`), survey analytics caching, teacher dashboards

### Custom User Model with Role System
The `accounts.models.User` extends `AbstractUser` with `user_type` field:
- `'student'` - Can view assigned surveys and submit responses
- `'teacher'` - Automatically gets `is_staff=True` and `is_superuser=True` on save (see `User.save()`)
- `'admin'` - Full system access

**Critical**: Always use `user.is_student`, `user.is_teacher`, `user.is_admin_user` properties, never compare `user_type` strings directly.

### Section-Based Access Control
`Section` model represents classes with teacher-student relationships:
- Teachers create surveys and assign them to sections via `Survey.sections` M2M
- Students see only surveys assigned to their enrolled sections
- Filter pattern: `Survey.objects.filter(sections__students=student_user)`

### Dual API Architecture
The project maintains **both traditional views and REST API endpoints**:
- Traditional views: `accounts/views.py`, `surveys/views.py`, etc. (use `@login_required`)
- API endpoints: `accounts/api_views.py`, `api_urls.py` (use DRF ViewSets with `permission_classes`)
- Frontend uses vanilla JS with `fetch()` for API calls, jQuery for survey builder drag-drop

## Development Workflows

### Database Setup (One Command)
```bash
python setup_db.py
```
This script does **everything**: migrations, creates users (admin/teacher1/student1-10), sections, sample surveys with questions, and activity logs. Use for fresh setups or testing.

**Never** manually run `python manage.py migrate` then create users separately - `setup_db.py` is the single source of truth.

### Running the Application
```bash
# Activate venv (Windows: venv\Scripts\activate)
source venv/bin/activate  # Linux/Mac

# Start server
python manage.py runserver
```

Default credentials: `admin/admin123`, `teacher1/teacher123`, `student1/student123`

### Verification
```bash
python verify_setup.py  # Checks if setup_db.py ran successfully
```

## Critical Django Conventions

### URL Routing Pattern
Main `eduquery/urls.py` includes app URLs:
```python
path('', include('accounts.urls')),           # Home, auth, dashboards
path('surveys/', include('surveys.urls')),    # Survey CRUD
path('api/surveys/', include('surveys.api_urls'))  # API endpoints
```
**Never** define app-specific URLs in `eduquery/urls.py` - always use app-level `urls.py` with namespaces.

### Template Organization
Templates follow `app_name/template_name.html` structure:
- `templates/accounts/StudentDashboard.html` - Student views
- `templates/accounts/TeacherDashboard.html` - Teacher views
- `templates/surveys/survey_builder.html` - Survey creation with drag-drop
- `templates/base.html` - Shared layout (navbar, footer, static includes)

Static files mirror this: `static/js/accounts/`, `static/css/accounts/`

### Authentication & Authorization
All non-public views use `@login_required` decorator. Role-based logic inside views:
```python
@login_required
def survey_list(request):
    if request.user.is_teacher:
        surveys = Survey.objects.filter(creator=request.user)
    elif request.user.is_student:
        surveys = Survey.objects.filter(sections__students=request.user)
```

## Data Model Relationships

### Survey Creation Flow
1. Teacher creates `Survey` (status='draft')
2. Adds `Question` objects with `question_type` (multiple_choice, checkbox, likert_scale, short_answer, long_answer)
3. For MCQ/checkbox: stores options in `Question.options` JSONField
4. For Likert: uses `likert_min`, `likert_max`, `likert_labels` fields
5. Assigns to sections via `Survey.sections.add(section)`
6. Changes `status='published'` to make visible

### Response Submission Flow
1. Student starts survey → creates `Response` (status='in_progress')
2. For each question → creates `Answer` linked to Response
3. On submit → sets `Response.status='submitted'`, `submitted_at=now()`
4. `Response.completion_time` property calculates duration

### Question Types & Storage
- **Multiple Choice**: Single selection, options in `Question.options` list
- **Checkbox**: Multi-selection, options in `Question.options` list
- **Likert Scale**: Numeric rating, uses `likert_min/max/labels` fields
- **Short Answer**: Text input, stored in `Answer.text_answer`
- **Long Answer**: Textarea, stored in `Answer.text_answer`

## Frontend Integration

### Survey Builder (jQuery UI + Drag-Drop)
`static/js/surveys/survey_builder.js` uses:
- jQuery UI's `.draggable()` for question type palette
- `.droppable()` on question container
- `.sortable()` for reordering questions
- Questions stored in JS array, serialized to JSON on save

When adding question types, update both:
1. `surveys/models.py` - `Question.QUESTION_TYPES` choices
2. `survey_builder.js` - `addQuestion()` and `renderQuestion()` functions

### API Request Pattern
Vanilla JS fetch with CSRF token:
```javascript
fetch('/api/surveys/', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken')
    },
    body: JSON.stringify(data)
})
```

## Testing & Debugging

### Sample Data Reset
```bash
python reset_and_populate.py  # Clears DB and re-runs setup_db.py
```

### Common Issues
- **"User object has no attribute 'is_teacher'"**: Using wrong User model - check `settings.AUTH_USER_MODEL` points to `accounts.User`
- **Survey not showing for student**: Check `Survey.status='published'` and student enrolled in assigned section
- **Teacher permissions denied**: Verify `User.save()` override sets `is_staff=True` for teachers

## Key Files for Common Tasks

### Adding a New Question Type
1. `surveys/models.py` - Add to `Question.QUESTION_TYPES`
2. `surveys/serializers.py` - Update `QuestionSerializer` if new fields needed
3. `static/js/surveys/survey_builder.js` - Add rendering logic in `renderQuestion()`
4. `templates/accounts/SurveyForm.html` - Add display logic for students

### Modifying User Roles
1. `accounts/models.py` - Update `USER_TYPE_CHOICES` and `User.save()`
2. `accounts/serializers.py` - Update `UserSerializer` validation
3. `accounts/views.py` - Add role-specific view logic
4. `setup_db.py` - Update sample user creation

### Adding Analytics
1. `analytics/models.py` - Create caching model (see `SurveyAnalytics`, `QuestionAnalytics`)
2. `analytics/views.py` - Add calculation view with `@login_required`
3. `templates/analytics/` - Create visualization template
4. `analytics/urls.py` - Wire up URL pattern

## Dependencies & Environment
- Django 5.2.7 - Framework core
- DRF 3.16.1 - REST API endpoints
- django-tailwind 4.3.1 - Utility-first CSS (not actively compiled)
- django-cors-headers - API CORS handling
- Pillow - Profile picture uploads
- SQLite - Development database (no PostgreSQL setup)

**No Docker, no complex build steps** - pure Python/Django with SQLite.

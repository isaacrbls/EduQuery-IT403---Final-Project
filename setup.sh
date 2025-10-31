#!/bin/bash

# EduQuery Setup Script
# Run this script to set up the development environment

echo "================================"
echo "EduQuery Setup Script"
echo "================================"
echo ""

# Check if virtual environment is activated
if [[ "$VIRTUAL_ENV" == "" ]]; then
    echo "Activating virtual environment..."
    source venv/bin/activate
else
    echo "Virtual environment already activated"
fi

echo ""
echo "Installing/Updating dependencies..."
pip install -r requirements.txt

echo ""
echo "Running Django checks..."
python manage.py check

echo ""
echo "================================"
echo "Setup complete!"
echo "================================"
echo ""
echo "Next steps:"
echo "1. Configure PostgreSQL in eduquery/settings.py"
echo "2. Create models in each app"
echo "3. Run: python manage.py makemigrations"
echo "4. Run: python manage.py migrate"
echo "5. Run: python manage.py createsuperuser"
echo "6. Run: python manage.py runserver"
echo ""
echo "Visit: http://127.0.0.1:8000/"
echo ""


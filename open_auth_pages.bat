@echo off
echo Opening EduQuery Authentication Pages...
echo.
echo Available pages:
echo 1. Main Index (Overview)
echo 2. Sign Up Page
echo 3. Sign In Page
echo.

REM Get the current directory
set "CURRENT_DIR=%~dp0"

REM Open the main index page in default browser
start "" "%CURRENT_DIR%templates\accounts\index_demo.html"

echo Index page opened in your default browser!
echo.
echo You can also manually open these files:
echo - %CURRENT_DIR%templates\accounts\index_demo.html (Main Overview)
echo - %CURRENT_DIR%templates\accounts\signup_standalone.html (Sign Up)
echo - %CURRENT_DIR%templates\accounts\signin.html (Sign In)
echo.
pause

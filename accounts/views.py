from django.shortcuts import render, redirect
from django.contrib.auth import logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages

# Create your views here.

def index(request):
    """Home page"""
    return render(request, 'accounts/index.html')

def signup(request):
    """User registration"""
    return render(request, 'accounts/signup.html')

def login_view(request):
    """User login"""
    return render(request, 'accounts/login.html')

def logout_view(request):
    """User logout"""
    logout(request)
    return redirect('accounts:login')

@login_required
def profile(request):
    """User profile"""
    return render(request, 'accounts/profile.html')

def forgot_password(request):
    """
    Render the Forgot Password page and accept email submission.
    For now, only show a success flash; integration with Django's
    password reset can be wired later.
    """
    if request.method == 'POST':
        email = request.POST.get('email', '').strip()
        if email:
            messages.success(request, 'If an account exists for that email, we\'ve sent reset instructions.')
            return redirect('accounts:forgot_password')
        else:
            messages.error(request, 'Please enter a valid email address.')
    return render(request, 'accounts/ForgotPassword.html')

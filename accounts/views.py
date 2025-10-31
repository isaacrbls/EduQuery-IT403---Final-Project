from django.shortcuts import render, redirect
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import HttpResponse

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


from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.

class User(AbstractUser):
    """Extended User model for the EduQuery platform"""
    USER_TYPE_CHOICES = (
        ('student', 'Student'),
        ('teacher', 'Teacher'),
        ('admin', 'Administrator'),
    )

    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES, default='student')
    student_id = models.CharField(max_length=20, blank=True, null=True, unique=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['username']

    def __str__(self):
        return f"{self.username} ({self.get_user_type_display()})"

    @property
    def is_student(self):
        return self.user_type == 'student'

    @property
    def is_teacher(self):
        return self.user_type == 'teacher'

    @property
    def is_admin_user(self):
        return self.user_type == 'admin' or self.is_superuser
    
    def save(self, *args, **kwargs):
        """Override save to automatically set is_staff and is_superuser for teachers"""
        if self.user_type == 'teacher':
            self.is_staff = True
            self.is_superuser = True
        elif self.user_type == 'student':
            self.is_staff = False
            self.is_superuser = False
        super().save(*args, **kwargs)


class Section(models.Model):
    """Model for class sections"""
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)
    teacher = models.ForeignKey(User, on_delete=models.CASCADE, related_name='teaching_sections')
    students = models.ManyToManyField(User, related_name='enrolled_sections', blank=True)
    description = models.TextField(blank=True, null=True)
    academic_year = models.CharField(max_length=20)
    semester = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ['code', 'academic_year', 'semester']

    def __str__(self):
        return f"{self.name} ({self.code})"

    @property
    def student_count(self):
        return self.students.count()


from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Section

# Register your models here.

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'user_type', 'student_id', 'is_active', 'date_joined']
    list_filter = ['user_type', 'is_active', 'is_staff', 'date_joined']
    search_fields = ['username', 'email', 'first_name', 'last_name', 'student_id']

    fieldsets = BaseUserAdmin.fieldsets + (
        ('Additional Info', {
            'fields': ('user_type', 'student_id', 'phone_number', 'profile_picture', 'bio')
        }),
    )

    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Additional Info', {
            'fields': ('user_type', 'student_id', 'email')
        }),
    )


@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'teacher', 'academic_year', 'semester', 'student_count', 'created_at']
    list_filter = ['academic_year', 'semester', 'created_at']
    search_fields = ['name', 'code', 'teacher__username', 'description']
    filter_horizontal = ['students']

    def student_count(self, obj):
        return obj.student_count
    student_count.short_description = 'Students'


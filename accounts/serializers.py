from rest_framework import serializers
from .models import User, Section


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name',
                  'user_type', 'student_id', 'phone_number', 'profile_picture',
                  'bio', 'created_at']
        read_only_fields = ['id', 'created_at']


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm',
                  'first_name', 'last_name', 'user_type', 'student_id']

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Passwords do not match")
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user


class SectionSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source='teacher.get_full_name', read_only=True)
    student_count = serializers.IntegerField(source='students.count', read_only=True)

    class Meta:
        model = Section
        fields = ['id', 'name', 'code', 'teacher', 'teacher_name',
                  'students', 'student_count', 'description',
                  'academic_year', 'semester', 'is_archived', 'created_at']
        read_only_fields = ['id', 'created_at', 'teacher']
    
    def create(self, validated_data):
        # Auto-set teacher from request context
        validated_data['teacher'] = self.context['request'].user
        return super().create(validated_data)


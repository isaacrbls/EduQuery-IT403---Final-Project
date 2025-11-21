from django import forms
from .models import Survey, Question
from accounts.models import Section


class SurveyForm(forms.ModelForm):
    class Meta:
        model = Survey
        fields = ['title', 'description', 'sections', 'due_date', 'is_active']
        widgets = {
            'title': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter survey title'
            }),
            'description': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 3,
                'placeholder': 'Enter survey description (optional)'
            }),
            'sections': forms.CheckboxSelectMultiple(),
            'due_date': forms.DateTimeInput(attrs={
                'type': 'datetime-local',
                'class': 'form-control'
            }),
            'is_active': forms.CheckboxInput(attrs={
                'class': 'form-check-input'
            }),
        }
        labels = {
            'title': 'Survey Title',
            'description': 'Description',
            'sections': 'Assign to Sections',
            'due_date': 'Due Date',
            'is_active': 'Make survey active immediately',
        }
        help_texts = {
            'is_active': 'Students can start responding once the survey is active',
        }

    def __init__(self, *args, **kwargs):
        user = kwargs.pop('user', None)
        super().__init__(*args, **kwargs)
        self.fields['due_date'].required = True
        if user:
            self.fields['sections'].queryset = Section.objects.filter(teacher=user)
        else:
            self.fields['sections'].queryset = Section.objects.all()

    def clean_title(self):
        title = self.cleaned_data.get('title')
        if not title or not title.strip():
            raise forms.ValidationError('Title is required.')
        if len(title) > 200:
            raise forms.ValidationError('Title must be 200 characters or less.')
        return title.strip()

    def clean_sections(self):
        sections = self.cleaned_data.get('sections')
        if not sections or sections.count() == 0:
            raise forms.ValidationError('At least one section is required.')
        return sections


class QuestionForm(forms.ModelForm):
    class Meta:
        model = Question
        fields = [
            'question_text',
            'question_type',
            'is_required',
            'options',
            'likert_min',
            'likert_max',
            'likert_labels'
        ]
        widgets = {
            'question_text': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 2,
                'id': 'id_question_text',
                'placeholder': 'Enter your question'
            }),
            'question_type': forms.Select(attrs={
                'class': 'form-select',
                'id': 'id_question_type'
            }),
            'is_required': forms.CheckboxInput(attrs={
                'class': 'form-check-input',
                'id': 'id_is_required'
            }),
            'options': forms.HiddenInput(attrs={
                'id': 'id_options'
            }),
            'likert_min': forms.NumberInput(attrs={
                'class': 'form-control',
                'id': 'id_likert_min',
                'min': 1
            }),
            'likert_max': forms.NumberInput(attrs={
                'class': 'form-control',
                'id': 'id_likert_max',
                'min': 1
            }),
            'likert_labels': forms.HiddenInput(attrs={
                'id': 'id_likert_labels'
            }),
        }
        labels = {
            'question_text': 'Question Text',
            'question_type': 'Question Type',
            'is_required': 'Required',
            'options': 'Options',
            'likert_min': 'Minimum Value',
            'likert_max': 'Maximum Value',
            'likert_labels': 'Scale Labels',
        }

    def clean_question_text(self):
        question_text = self.cleaned_data.get('question_text')
        if not question_text or not question_text.strip():
            raise forms.ValidationError('Question text is required.')
        return question_text.strip()

    def clean_options(self):
        options = self.cleaned_data.get('options')
        question_type = self.cleaned_data.get('question_type')
        
        if question_type in ['multiple_choice', 'mcq', 'checkbox', 'dropdown']:
            if not options or len(options) < 2:
                raise forms.ValidationError('Multiple choice questions must have at least 2 options.')
            
            filtered_options = [opt.strip() for opt in options if opt and opt.strip()]
            if len(filtered_options) < 2:
                raise forms.ValidationError('Multiple choice questions must have at least 2 non-empty options.')
            return filtered_options
        
        return options

    def clean(self):
        cleaned_data = super().clean()
        question_type = cleaned_data.get('question_type')
        likert_min = cleaned_data.get('likert_min')
        likert_max = cleaned_data.get('likert_max')
        
        if question_type in ['likert_scale', 'likert', 'rating']:
            if likert_min is None or likert_max is None:
                raise forms.ValidationError('Likert scale questions must have min and max values.')
            if likert_min >= likert_max:
                raise forms.ValidationError('Maximum value must be greater than minimum value.')
            if likert_min < 1:
                raise forms.ValidationError('Minimum value must be at least 1.')
        
        return cleaned_data

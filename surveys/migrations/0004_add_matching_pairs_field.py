# Generated migration for adding matching_pairs JSONField and fixing MatchingPair related_name

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('surveys', '0002_rename_required_question_is_required_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='question',
            name='matching_pairs',
            field=models.JSONField(blank=True, default=list),
        ),
    ]

# Generated migration for adding matching_pairs JSONField and fixing MatchingPair related_name

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('surveys', '0003_rename_required_question_is_active_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='question',
            name='matching_pairs',
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AlterField(
            model_name='matchingpair',
            name='question',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name='matching_pair_items',
                to='surveys.question'
            ),
        ),
    ]

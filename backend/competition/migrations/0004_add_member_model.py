from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('competition', '0003_create_admin_user'),
    ]

    operations = [
        # Create Member model
        migrations.CreateModel(
            name='Member',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('score', models.IntegerField(default=0, help_text="Member's individual score")),
                ('church', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='members', to='competition.church')),
            ],
            options={
                'ordering': ['-score', 'name'],
            },
        ),
        
        # Add member field to ScoreTransaction (nullable for backward compatibility)
        migrations.AddField(
            model_name='scoretransaction',
            name='member',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='transactions', to='competition.member'),
        ),
        
        # Make church nullable in ScoreTransaction (now transactions are primarily member-based)
        migrations.AlterField(
            model_name='scoretransaction',
            name='church',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='scores', to='competition.church'),
        ),
        
        # Update ScoreTransaction ordering
        migrations.AlterModelOptions(
            name='scoretransaction',
            options={'ordering': ['-timestamp']},
        ),
    ]

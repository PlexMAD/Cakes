# Generated by Django 5.1.1 on 2024-11-29 03:56

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('system', '0022_merge_20241129_0647'),
    ]

    operations = [
        migrations.AlterField(
            model_name='qualityassurance',
            name='comment',
            field=models.TextField(blank=True, null=True),
        ),
    ]

# Generated by Django 5.1.1 on 2024-11-11 07:02

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('system', '0014_mappoint_workshop_workshopmappoint'),
    ]

    operations = [
        migrations.AddField(
            model_name='workshop',
            name='points',
            field=models.ManyToManyField(related_name='workshops', through='system.WorkshopMapPoint', to='system.mappoint'),
        ),
    ]

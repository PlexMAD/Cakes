# Generated by Django 5.1.1 on 2024-10-31 21:44

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('system', '0008_alter_ingredientsspecification_quantity'),
    ]

    operations = [
        migrations.CreateModel(
            name='CakeDecorationSpecification',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('quantity', models.DecimalField(db_column='quantity', decimal_places=2, max_digits=10)),
                ('cake_decoration', models.ForeignKey(db_column='cake_decoration', on_delete=django.db.models.deletion.DO_NOTHING, to='system.cakedecoration')),
                ('product', models.ForeignKey(db_column='product', on_delete=django.db.models.deletion.DO_NOTHING, to='system.product')),
            ],
            options={
                'db_table': 'CakeDecorationSpecification',
            },
        ),
    ]

# Generated by Django 5.1.1 on 2024-10-31 21:42

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('system', '0006_remove_ingredient_product_ingredientsspecification'),
    ]

    operations = [
        migrations.AlterModelTable(
            name='ingredientsspecification',
            table='IngredientsSpecification',
        ),
    ]

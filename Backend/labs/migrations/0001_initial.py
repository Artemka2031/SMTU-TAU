import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Direction',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True)),
                ('description', models.TextField(blank=True, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='LabWork',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('short', models.CharField(max_length=100)),
                ('full', models.CharField(max_length=255)),
                ('note', models.TextField(blank=True, null=True)),
                ('active_graph', models.CharField(default='ПХ', max_length=100)),
                ('calc_module', models.CharField(blank=True, help_text="Имя Python-модуля для расчётов, например 'labs.directions.tau_nolin.lab1.Lab1_TAU_NoLin'.", max_length=255, null=True)),
                ('direction', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='labs', to='labs.direction')),
            ],
        ),
        migrations.CreateModel(
            name='LabParameter',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('value', models.CharField(max_length=100)),
                ('lab', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='parameters', to='labs.labwork')),
            ],
        ),
        migrations.CreateModel(
            name='GraphType',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('x_label', models.CharField(default='X', max_length=100)),
                ('y_label', models.CharField(default='Y', max_length=100)),
                ('log_x', models.BooleanField(default=False)),
                ('lab', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='graphs', to='labs.labwork')),
            ],
        ),
    ]

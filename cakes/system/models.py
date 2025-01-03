from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import PermissionsMixin
from django.db import models


class Supplier(models.Model):
    id = models.AutoField(db_column='ID', primary_key=True, blank=True)
    address = models.TextField()
    delivery_deadline = models.DateField(db_column='deadline', blank=True, null=True)


class UserManager(BaseUserManager):
    def create_user(self, login, password=None, **extra_fields):
        if not login:
            raise ValueError('The Email field must be set')
        login = self.normalize_login(login)
        user = self.model(login=login, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)


class Users(AbstractBaseUser, PermissionsMixin):
    id = models.AutoField(db_column='ID', primary_key=True, blank=True)
    login = models.TextField(db_column='Email', unique=True)
    password = models.TextField(db_column='Password')
    full_name = models.TextField(db_column='FullName', blank=True, null=True)
    role = models.TextField(db_column='role')
    photo = models.ImageField(upload_to="images/", blank=True, null=True)

    last_login = None
    is_superuser = None
    groups = None
    user_permissions = None

    USERNAME_FIELD = 'login'
    REQUIRED_FIELDS = []
    objects = UserManager()

    def __str__(self):
        return self.login


class CakeDecoration(models.Model):
    id = models.AutoField(db_column='ID', primary_key=True, blank=True)
    article = models.CharField(max_length=100)
    name = models.CharField(max_length=255)
    unit_of_measurement = models.CharField(max_length=50)
    quantity = models.PositiveIntegerField()
    main_supplier = models.ForeignKey('Supplier', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='images/')
    decoration_type = models.CharField(max_length=100)
    purchase_price = models.DecimalField(max_digits=10, decimal_places=2)
    weight = models.DecimalField(max_digits=5, decimal_places=2)
    expiry_date = models.DateField(null=True, blank=True, verbose_name="Срок годности")  # Новое поле

    def __str__(self):
        return self.name


class Ingredient(models.Model):
    id = models.AutoField(primary_key=True)
    article = models.CharField(max_length=100, verbose_name="Артикул")
    name = models.CharField(max_length=200, verbose_name="Наименование")
    unit_of_measure = models.CharField(max_length=50, verbose_name="Единица измерения")
    quantity = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Количество")
    main_supplier = models.ForeignKey('Supplier', on_delete=models.CASCADE, verbose_name="Основной поставщик")
    image = models.ImageField(upload_to='images/', null=True, blank=True, verbose_name="Изображение")
    ingredient_type = models.CharField(max_length=100, verbose_name="Тип ингредиента")
    purchase_price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Закупочная цена")
    gost = models.CharField(max_length=50, verbose_name="ГОСТ", null=True, blank=True)
    packing = models.CharField(max_length=100, verbose_name="Фасовка")
    characteristic = models.TextField(verbose_name="Характеристика", null=True, blank=True)
    expiry_date = models.DateField(null=True, blank=True, verbose_name="Срок годности")

    def __str__(self):
        return self.name


class Product(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=200, verbose_name="Наименование")
    size = models.CharField(max_length=200)

    class Meta:
        db_table = 'w_Product'


class IngredientsSpecification(models.Model):
    product = models.ForeignKey(Product, models.DO_NOTHING, db_column='product')
    ingredient = models.ForeignKey(Ingredient, models.DO_NOTHING, db_column='ingredient')
    quantity = models.DecimalField(db_column='quantity', max_digits=10, decimal_places=2)

    class Meta:
        db_table = 'w_IngredientsSpecification'


class CakeDecorationSpecification(models.Model):
    product = models.ForeignKey(Product, models.DO_NOTHING, db_column='product')
    cake_decoration = models.ForeignKey(CakeDecoration, models.DO_NOTHING, db_column='cake_decoration')
    quantity = models.DecimalField(db_column='quantity', max_digits=10, decimal_places=2)

    class Meta:
        db_table = 'w_CakeDecorationSpecification'


class SemiproductsSpecification(models.Model):
    product = models.ForeignKey(Product, models.DO_NOTHING, db_column='product', related_name='specification_product')
    semiproduct = models.ForeignKey(Product, models.DO_NOTHING, db_column='semiproduct',
                                    related_name='specification_semiproduct')
    quantity = models.DecimalField(db_column='quantity', max_digits=10, decimal_places=2)

    class Meta:
        db_table = 'w_SemiproductsSpecification'


class Status(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100, verbose_name="Название")


class Order(models.Model):
    id = models.AutoField(primary_key=True)
    number = models.CharField(max_length=100, verbose_name="Номер")
    date = models.DateField(db_column='date', blank=True, null=True)
    name = models.CharField(max_length=255)
    product = models.ForeignKey(Product, models.DO_NOTHING, db_column='product')
    buyer = models.ForeignKey(Users, models.DO_NOTHING, db_column='buyer', related_name='orders_as_buyer')
    manager = models.ForeignKey(Users, models.DO_NOTHING, db_column='manager', related_name='orders_as_manager')
    price = models.DecimalField(db_column='price', max_digits=10, decimal_places=2)
    deadline = models.DateField(db_column='deadline', blank=True, null=True)
    examples = models.CharField(max_length=100, verbose_name="Примеры")
    status = models.ForeignKey(Status, models.DO_NOTHING, db_column='Статус', null=True)


class EquipmentType(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100, verbose_name="Тип оборудования")


class Equipment(models.Model):
    id = models.AutoField(primary_key=True)
    equipment_number = models.CharField(max_length=100, verbose_name="Инвентарный номер")
    type = models.ForeignKey(EquipmentType, on_delete=models.CASCADE, verbose_name="Тип оборудования")
    description = models.CharField(max_length=200, blank=True, null=True)
    durability = models.CharField(max_length=200, blank=True, null=True)
    main_supplier = models.ForeignKey('Supplier', on_delete=models.CASCADE, blank=True, null=True)
    purchase_date = models.DateField(db_column='purchase_date', blank=True, null=True)
    quantity = models.PositiveIntegerField(blank=True, null=True)


class OperationsSpecification(models.Model):
    id = models.AutoField(primary_key=True)
    product = models.ForeignKey(Product, models.DO_NOTHING, db_column='product')
    name = models.CharField(max_length=100, verbose_name="Название")
    equipment_type = models.ForeignKey(EquipmentType, on_delete=models.CASCADE, verbose_name="Тип оборудования")
    operation_number = models.CharField(max_length=50, verbose_name="Код операции")
    time_required = models.DecimalField(max_digits=5, decimal_places=2, verbose_name="Время на операцию")


class MapPoint(models.Model):
    id = models.AutoField(primary_key=True)
    image = models.ImageField(upload_to='images/', null=True, blank=True, verbose_name="Изображение")

    class Meta:
        db_table = 'z_points'


class Workshop(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100, verbose_name="Название")
    points = models.ManyToManyField('MapPoint', through='WorkshopMapPoint', related_name='workshops')

    class Meta:
        db_table = 'z_workshop'


class WorkshopMapPoint(models.Model):
    workshop = models.ForeignKey(Workshop, on_delete=models.CASCADE, db_column='workshop')
    map_point = models.ForeignKey(MapPoint, on_delete=models.CASCADE, db_column='map_point')
    x_axis = models.IntegerField(null=True, blank=True)
    y_axis = models.IntegerField(null=True, blank=True)

    class Meta:
        db_table = 'z_workshop_map_points'


class QualityAssurance(models.Model):
    id = models.AutoField(primary_key=True)
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    parameter = models.CharField(max_length=100)
    assured = models.BooleanField()
    comment = models.TextField(null=True, blank=True)


class EquipmentProblem(models.Model):
    id = models.AutoField(primary_key=True)
    Equipment = models.ForeignKey(Equipment, on_delete=models.CASCADE)
    occur_time = models.DateTimeField()
    comment = models.TextField(null=True, blank=True)
    end_time = models.DateTimeField(null=True, blank=True)

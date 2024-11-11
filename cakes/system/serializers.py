from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import *


class UsersSerializer(serializers.ModelSerializer):
    class Meta:
        model = Users
        fields = '__all__'


class EquipmentSerializer(serializers.ModelSerializer):
    type = serializers.PrimaryKeyRelatedField(queryset=EquipmentType.objects.all(), write_only=True)
    type_name = serializers.CharField(source='type.name', read_only=True)

    class Meta:
        model = Equipment
        fields = ['id', 'equipment_number', 'type', 'type_name', 'description', 'durability', 'main_supplier',
                  'purchase_date', 'quantity']


class EquipmentTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = EquipmentType
        fields = '__all__'


class IngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingredient
        fields = '__all__'


class CakeDecorationSerializer(serializers.ModelSerializer):
    class Meta:
        model = CakeDecoration
        fields = '__all__'


class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = '__all__'


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        login = attrs['login']

        try:
            user = Users.objects.get(login=login)

            if not user.check_password(attrs['password']):
                raise serializers.ValidationError('Неверный пароль.')

            return super().validate(attrs)

        except Users.DoesNotExist:
            raise serializers.ValidationError('Неверный логин.')


class PointsSerializer(serializers.ModelSerializer):
    class Meta:
        model = MapPoint
        fields = '__all__'


class WorkshopSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workshop
        fields = '__all__'


class WorkshopPointsSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkshopMapPoint
        fields = '__all__'


class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = '__all__'


class StatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Status
        fields = '__all__'

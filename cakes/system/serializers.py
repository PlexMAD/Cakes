from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Users


class UsersSerializer(serializers.ModelSerializer):
    class Meta:
        model = Users
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

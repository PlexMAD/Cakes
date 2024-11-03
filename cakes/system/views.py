from datetime import datetime

from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import *
from .serializers import *


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    user = request.user
    serializer = UsersSerializer(user)
    return Response(serializer.data)


class UserViewSet(viewsets.ModelViewSet):
    queryset = Users.objects.all()
    serializer_class = UsersSerializer


class EquipmentViewSet(viewsets.ModelViewSet):
    queryset = Equipment.objects.all()
    serializer_class = EquipmentSerializer


class EquipmentTypeViewSet(viewsets.ModelViewSet):
    queryset = EquipmentType.objects.all()
    serializer_class = EquipmentTypeSerializer


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        login = request.data.get('login')

        try:
            response = super().post(request, *args, **kwargs)
            if response.status_code == status.HTTP_200_OK:
                user = Users.objects.get(login=login)

            return response
        except Exception as e:
            error_messages = e.detail.get('non_field_errors', [])
            return Response({"detail": error_messages}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class IngredientsViewSet(viewsets.ModelViewSet):
    queryset = Ingredient.objects.all()
    serializer_class = IngredientSerializer

    @action(detail=False, methods=['get'], url_path='search')
    def search(self, request):
        expiry_date = request.query_params.get('expiry_date')

        try:
            selected_date = datetime.strptime(expiry_date, '%Y-%m-%d').date()
        except ValueError:
            return Response({"detail": "Неверный формат даты. Используйте формат ГГГГ-ММ-ДД."},
                            status=status.HTTP_400_BAD_REQUEST)
        ingredients = self.queryset.filter(expiry_date__lt=selected_date)
        serializer = self.get_serializer(ingredients, many=True)
        return Response(serializer.data)


class CakeDecorationViewSet(viewsets.ModelViewSet):
    queryset = CakeDecoration.objects.all()
    serializer_class = CakeDecorationSerializer

    @action(detail=False, methods=['get'], url_path='search')
    def search(self, request):
        expiry_date = request.query_params.get('expiry_date')

        try:
            selected_date = datetime.strptime(expiry_date, '%Y-%m-%d').date()
        except ValueError:
            return Response({"detail": "Неверный формат даты. Используйте формат ГГГГ-ММ-ДД."},
                            status=status.HTTP_400_BAD_REQUEST)
        decorations = self.queryset.filter(expiry_date__lt=selected_date)
        serializer = self.get_serializer(decorations, many=True)
        return Response(serializer.data)

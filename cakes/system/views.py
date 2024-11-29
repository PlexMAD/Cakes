from datetime import datetime

from django.db import transaction
from django.shortcuts import render
from rest_framework import viewsets, status, generics
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.test import APIRequestFactory, force_authenticate
from rest_framework.views import APIView
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


class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer


class PointsViewSet(viewsets.ModelViewSet):
    queryset = MapPoint.objects.all()
    serializer_class = PointsSerializer


class WorkshopViewSet(viewsets.ModelViewSet):
    queryset = Workshop.objects.all()
    serializer_class = WorkshopSerializer


class WorkshopPointsViewSet(viewsets.ModelViewSet):
    queryset = WorkshopMapPoint.objects.all()
    serializer_class = WorkshopPointsSerializer

    def get_queryset(self):
        workshop_id = self.request.query_params.get('workshop')
        queryset = WorkshopMapPoint.objects.all()
        if workshop_id is not None:
            queryset = queryset.filter(workshop_id=workshop_id)
        return queryset


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer


class StatusViewSet(viewsets.ModelViewSet):
    queryset = Status.objects.all()
    serializer_class = StatusSerializer


class QualityAssuranceViewSet(viewsets.ModelViewSet):
    queryset = QualityAssurance.objects.all()
    serializer_class = QualityAssuranceSerializer

    def get_queryset(self):
        order = self.request.query_params.get('order')
        queryset = QualityAssurance.objects.all()
        if order is not None:
            queryset = queryset.filter(order=order)
        return queryset


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


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    @action(detail=True, methods=['get'])
    def produce(self, request, pk=None):
        product = self.get_object()
        try:
            with transaction.atomic():
                ingredients_spec = IngredientsSpecification.objects.filter(product=product)
                decorations_spec = CakeDecorationSpecification.objects.filter(product=product)
                semiproducts_spec = SemiproductsSpecification.objects.filter(product=product)

                for spec in ingredients_spec:
                    ingredient = spec.ingredient
                    if ingredient.quantity < spec.quantity:
                        return Response({"error": f"Недостаточно: {ingredient.name}"},
                                        status=status.HTTP_400_BAD_REQUEST)
                    ingredient.quantity -= spec.quantity
                    ingredient.save()

                for spec in decorations_spec:
                    decoration = spec.cake_decoration
                    if decoration.quantity < spec.quantity:
                        return Response({"error": f"Недостаточно: {decoration.name}"},
                                        status=status.HTTP_400_BAD_REQUEST)
                    decoration.quantity -= spec.quantity
                    decoration.save()

                for spec in semiproducts_spec:
                    semiproduct = spec.semiproduct
                    for i in range(0, int(spec.quantity)):
                        factory = APIRequestFactory()
                        sub_request = factory.post(f"/api/products/{semiproduct.id}/produce/")
                        force_authenticate(sub_request, user=request.user)
                        sub_response = ProductViewSet.as_view({'post': 'produce'})(sub_request, pk=semiproduct.id)
                        if sub_response.status_code != status.HTTP_200_OK:
                            return Response({"error": f"Unable to produce semiproduct: {semiproduct.name}"},
                                            status=sub_response.status_code)
                        semiproduct.save()
                return Response({"message": "Product successfully produced"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

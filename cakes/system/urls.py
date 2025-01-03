from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'equipment', EquipmentViewSet)
router.register(r'equipmenttype', EquipmentTypeViewSet)
router.register(r'ingredients', IngredientsViewSet)
router.register(r'cakedecorations', CakeDecorationViewSet)
router.register(r'supplier', SupplierViewSet)
router.register(r'points', PointsViewSet)
router.register(r'workshop', WorkshopViewSet)
router.register(r'workshop_points', WorkshopPointsViewSet)
router.register(r'order', OrderViewSet)
router.register(r'status', StatusViewSet)
router.register(r'quality', QualityAssuranceViewSet)
router.register(r'product', ProductViewSet)
router.register(r'equip_problem', EquipmentProblemViewSet)

router.register(r'ingredient_spec', IngredientsSpecificationViewSet)
router.register(r'cakedecoration_spec', CakeDecorationsSpecificationViewSet)
router.register(r'operation_spec', OperationsSpecificationViewSet)
router.register(r'semiproduct_spec', SemiProductsSpecificationViewSet)
urlpatterns = [
    path('', include(router.urls)),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('current_user/', current_user, name='current_user'),
]

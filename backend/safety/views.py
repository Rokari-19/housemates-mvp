from rest_framework import generics,permissions
from .serializers import ReportSerializer
class ReportCreateView(generics.CreateAPIView):
 serializer_class=ReportSerializer;permission_classes=[permissions.IsAuthenticated]
 def perform_create(self,serializer):serializer.save(reporter=self.request.user)

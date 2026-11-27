from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from accounts.models import SeekerProfile
from .engine import match_profiles
class MatchesView(APIView):
 permission_classes=[IsAuthenticated]
 def get(self,request):
  own=getattr(request.user,'seeker_profile',None)
  if not own:return Response({'detail':'Complete a seeker profile to see matches.'},status=400)
  profiles=SeekerProfile.objects.exclude(user=request.user).select_related('user')[:100];data=[]
  for p in profiles:
   if own.budget_max and p.budget_min and (own.budget_max<p.budget_min or p.budget_max<own.budget_min):continue
   result=match_profiles(own,p);result.update({'user_id':p.user_id,'display_name':p.user.display_name,'bio':p.bio,'budget_min':p.budget_min,'budget_max':p.budget_max,'areas':p.preferred_areas});data.append(result)
  return Response(sorted(data,key=lambda x:x['score'] or 0,reverse=True))

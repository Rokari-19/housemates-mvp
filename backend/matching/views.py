from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import SeekerProfile, User
from safety.models import Block
from .engine import match_profiles
from .models import Introduction


class MatchesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != "seeker":
            raise PermissionDenied("Housemate discovery is available to seeker accounts.")
        own, _ = SeekerProfile.objects.get_or_create(user=request.user)
        if not own.seeking_housemate:
            return Response({"detail": "Turn on housemate discovery in your profile to see matches."}, status=400)
        blocked_ids = Block.objects.filter(blocker=request.user).values_list("blocked_id", flat=True)
        blocked_by_ids = Block.objects.filter(blocked=request.user).values_list("blocker_id", flat=True)
        profiles = SeekerProfile.objects.exclude(user=request.user).exclude(
            user_id__in=blocked_ids
        ).exclude(user_id__in=blocked_by_ids).filter(
            user__is_active=True, seeking_housemate=True
        ).select_related("user")
        results = []
        for profile in profiles[:250]:
            match = match_profiles(own, profile)
            if match is None:
                continue
            user = profile.user
            results.append({
                **match,
                "user_id": user.id,
                "display_name": user.display_name or user.get_full_name() or user.username,
                "avatar": user.avatar,
                "status": profile.status,
                "institution": profile.institution,
                "ppa": profile.ppa,
                "bio": profile.bio,
                "budget_min": profile.budget_min,
                "budget_max": profile.budget_max,
                "areas": profile.preferred_areas,
                "cleanliness": profile.cleanliness,
                "sleep_schedule": profile.sleep_schedule,
                "guest_frequency": profile.guest_frequency,
                "work_mode": profile.work_mode,
            })
        results.sort(key=lambda item: item["score"] or 0, reverse=True)
        return Response(results)


class IntroductionListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = Introduction.objects.filter(
            Q(sender=request.user) | Q(recipient=request.user)
        ).select_related("sender", "recipient")
        return Response([self.serialize(item, request.user) for item in qs])

    def post(self, request):
        recipient = get_object_or_404(User, pk=request.data.get("recipient_id"), is_active=True)
        if request.user.role != "seeker" or recipient.role != "seeker":
            raise PermissionDenied("Introductions are available between home-seeker accounts.")
        if recipient == request.user:
            return Response({"detail": "You cannot introduce yourself."}, status=400)
        if Block.objects.filter(
            Q(blocker=request.user, blocked=recipient) | Q(blocker=recipient, blocked=request.user)
        ).exists():
            return Response({"detail": "This introduction is unavailable."}, status=403)

        existing = Introduction.objects.filter(sender=request.user, recipient=recipient).first()
        reverse = Introduction.objects.filter(sender=recipient, recipient=request.user).first()
        for item in (existing, reverse):
            if item and item.status in ("pending", "accepted"):
                return Response({"detail": "An introduction already exists between these users."}, status=409)

        if existing:
            existing.status = "pending"
            existing.message = request.data.get("message", "")[:500]
            existing.save(update_fields=["status", "message", "updated_at"])
            item = existing
        else:
            item = Introduction.objects.create(
                sender=request.user,
                recipient=recipient,
                message=request.data.get("message", "")[:500],
            )
        return Response(self.serialize(item, request.user), status=201)

    @staticmethod
    def serialize(item, viewer):
        return {
            "id": item.id,
            "sender_id": item.sender_id,
            "recipient_id": item.recipient_id,
            "sender_name": item.sender.display_name or item.sender.username,
            "recipient_name": item.recipient.display_name or item.recipient.username,
            "message": item.message,
            "status": item.status,
            "is_recipient": item.recipient_id == viewer.id,
            "created_at": item.created_at,
        }


class IntroductionRespondView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        item = get_object_or_404(Introduction, pk=pk)
        if item.recipient_id != request.user.id:
            raise PermissionDenied("Only the recipient can respond to this introduction.")
        if item.status != "pending":
            return Response({"detail": "This introduction has already been answered."}, status=409)
        new_status = request.data.get("status")
        if new_status not in ("accepted", "declined"):
            return Response({"detail": "Choose accepted or declined."}, status=400)
        item.status = new_status
        item.save(update_fields=["status", "updated_at"])
        return Response(IntroductionListView.serialize(item, request.user))

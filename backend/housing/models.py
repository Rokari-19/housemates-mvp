from django.db import models
from django.conf import settings
class Listing(models.Model):
 TYPES=[('room','Room in shared apartment'),('private','Private room'),('shared','Shared apartment'),('flat','Entire apartment'),('house','House'),('commercial','Commercial space'),('hostel','Hostel')]
 STATUS=[('draft','Draft'),('active','Active'),('paused','Paused'),('review','Under review'),('removed','Removed')]
 owner=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE,related_name='listings')
 title=models.CharField(max_length=180);description=models.TextField(max_length=4000);listing_type=models.CharField(max_length=16,choices=TYPES)
 city=models.CharField(max_length=80,default='Abuja');area=models.CharField(max_length=120);address_hint=models.CharField(max_length=255,blank=True)
 rent=models.PositiveIntegerField();rent_period=models.CharField(max_length=20,default='yearly');deposit=models.PositiveIntegerField(default=0)
 agency_fee=models.PositiveIntegerField(default=0);agreement_fee=models.PositiveIntegerField(default=0);service_charge=models.PositiveIntegerField(default=0);utility_estimate=models.PositiveIntegerField(default=0)
 bedrooms=models.PositiveSmallIntegerField(default=1);bathrooms=models.PositiveSmallIntegerField(default=1);available_from=models.DateField(null=True,blank=True)
 amenities=models.JSONField(default=list,blank=True);house_rules=models.JSONField(default=list,blank=True)
 latitude=models.DecimalField(max_digits=9,decimal_places=6,null=True,blank=True);longitude=models.DecimalField(max_digits=9,decimal_places=6,null=True,blank=True)
 verified_identity=models.BooleanField(default=False);verified_location=models.BooleanField(default=False);authority_checked=models.BooleanField(default=False);inspection_checked=models.BooleanField(default=False);verification_date=models.DateField(null=True,blank=True)
 status=models.CharField(max_length=16,choices=STATUS,default='draft');created_at=models.DateTimeField(auto_now_add=True);updated_at=models.DateTimeField(auto_now=True)
 class Meta: ordering=['-created_at']
 def __str__(self):return self.title
 @property
 def move_in_total(self):return self.rent+self.deposit+self.agency_fee+self.agreement_fee+self.service_charge+self.utility_estimate
class ListingPhoto(models.Model):
 listing=models.ForeignKey(Listing,on_delete=models.CASCADE,related_name='photos');image=models.URLField();caption=models.CharField(max_length=160,blank=True);sort_order=models.PositiveSmallIntegerField(default=0)
class HostelProfile(models.Model):
 listing=models.OneToOneField(Listing,on_delete=models.CASCADE,related_name='hostel_details');institution=models.CharField(max_length=160,blank=True);room_types=models.JSONField(default=list,blank=True);session_price=models.PositiveIntegerField(null=True,blank=True);bedspaces_available=models.PositiveSmallIntegerField(default=0);rules=models.JSONField(default=list,blank=True)
class Enquiry(models.Model):
 listing=models.ForeignKey(Listing,on_delete=models.CASCADE,related_name='enquiries');seeker=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE,related_name='enquiries');message=models.TextField(max_length=1000);status=models.CharField(max_length=16,default='new',choices=[('new','New'),('responded','Responded'),('closed','Closed')]);created_at=models.DateTimeField(auto_now_add=True)

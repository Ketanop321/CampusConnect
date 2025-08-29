import uuid
from django.db import models
from django.utils import timezone
from accounts.models import User

class RoommatePost(models.Model):
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
        ('A', 'Any')
    ]
    
    OCCUPATION_CHOICES = [
        ('student', 'Student'),
        ('working', 'Working Professional'),
        ('other', 'Other')
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='roommate_posts')
    title = models.CharField(max_length=200)
    description = models.TextField()
    location = models.CharField(max_length=200)
    rent = models.DecimalField(max_digits=10, decimal_places=2)
    available_from = models.DateField()
    lease_duration = models.PositiveIntegerField(help_text="Lease duration in months")
    room_type = models.CharField(max_length=50, choices=[
        ('private', 'Private Room'),
        ('shared', 'Shared Room'),
        ('apartment', 'Entire Apartment')
    ])
    preferred_gender = models.CharField(max_length=1, choices=GENDER_CHOICES, default='A')
    current_occupants = models.PositiveIntegerField(default=1)
    total_occupants = models.PositiveIntegerField(default=2)
    has_furniture = models.BooleanField(default=False)
    has_parking = models.BooleanField(default=False)
    has_laundry = models.BooleanField(default=False)
    has_kitchen = models.BooleanField(default=True)
    has_wifi = models.BooleanField(default=True)
    is_pets_allowed = models.BooleanField(default=False)
    is_smoking_allowed = models.BooleanField(default=False)
    occupation = models.CharField(max_length=50, choices=OCCUPATION_CHOICES, default='student')
    university = models.CharField(max_length=200, blank=True, null=True)
    contact_number = models.CharField(max_length=15)
    contact_email = models.EmailField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Roommate Post'
        verbose_name_plural = 'Roommate Posts'

    def __str__(self):
        return f"{self.title} - {self.location} (${self.rent}/month)"

    def save(self, *args, **kwargs):
        if not self.contact_email and self.user:
            self.contact_email = self.user.email
        super().save(*args, **kwargs)

class RoommateImage(models.Model):
    post = models.ForeignKey(RoommatePost, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='roommate/')
    is_primary = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-is_primary', 'uploaded_at']

    def __str__(self):
        return f"Image for {self.post.title}"
    
    def save(self, *args, **kwargs):
        # If this is the first image for the post, set it as primary
        if not self.pk and not self.post.images.exists():
            self.is_primary = True
        super().save(*args, **kwargs)

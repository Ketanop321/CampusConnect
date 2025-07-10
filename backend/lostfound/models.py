import uuid
from django.db import models
from accounts.models import User

class LostFoundItem(models.Model):
    LOST = 'lost'
    FOUND = 'found'
    STATUS_CHOICES = [
        (LOST, 'Lost'),
        (FOUND, 'Found'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    item_name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=LOST)
    location = models.CharField(max_length=200, blank=True, null=True)
    date_reported = models.DateTimeField(auto_now_add=True)
    date_occurred = models.DateTimeField(blank=True, null=True)
    reporter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reported_items')
    claimed_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='claimed_items'
    )
    is_resolved = models.BooleanField(default=False)
    image = models.URLField(blank=True, null=True)
    contact_info = models.CharField(max_length=200, blank=True, null=True)
    category = models.CharField(max_length=50, blank=True, null=True)
    color = models.CharField(max_length=50, blank=True, null=True)
    brand = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date_reported']
        verbose_name = 'Lost & Found Item'
        verbose_name_plural = 'Lost & Found Items'

    def __str__(self):
        return f"{self.get_status_display()}: {self.item_name} ({self.date_reported.strftime('%Y-%m-%d')})"

    def save(self, *args, **kwargs):
        if self.status == self.FOUND and not self.date_occurred:
            self.date_occurred = timezone.now()
        super().save(*args, **kwargs)

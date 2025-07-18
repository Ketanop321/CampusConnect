import uuid
from django.db import models
from django.utils import timezone
from accounts.models import User

class BookPost(models.Model):
    CONDITION_CHOICES = [
        ('new', 'New'),
        ('good', 'Good'),
        ('fair', 'Fair'),
        ('poor', 'Poor'),
    ]
    
    TRANSACTION_TYPE = [
        ('sell', 'Sell'),
        ('donate', 'Donate'),
        ('exchange', 'Exchange'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    author = models.CharField(max_length=200)
    isbn = models.CharField('ISBN', max_length=13, unique=True, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    condition = models.CharField(max_length=10, choices=CONDITION_CHOICES, default='good')
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPE, default='sell')
    department = models.CharField(max_length=100)
    course_code = models.CharField(max_length=20, blank=True, null=True)
    posted_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='book_posts')
    contact_email = models.EmailField()
    contact_phone = models.CharField(max_length=15, blank=True, null=True)
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Book Post'
        verbose_name_plural = 'Book Posts'
    
    def __str__(self):
        price_info = f" - ${self.price}" if self.price and self.transaction_type == 'sell' else ''
        return f"{self.title} by {self.author}{price_info} ({self.get_condition_display()})"
    
    def save(self, *args, **kwargs):
        if not self.contact_email and hasattr(self, 'posted_by'):
            self.contact_email = self.posted_by.email
        super().save(*args, **kwargs)

class BookImage(models.Model):
    book = models.ForeignKey(BookPost, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='bookbank/')
    is_primary = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-is_primary', 'uploaded_at']
        verbose_name = 'Book Image'
        verbose_name_plural = 'Book Images'
    
    def __str__(self):
        return f"Image for {self.book.title}"
    
    def save(self, *args, **kwargs):
        # If this is the first image for the book, set it as primary
        if not self.pk and not self.book.images.exists():
            self.is_primary = True
        super().save(*args, **kwargs)

class BookRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('completed', 'Completed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    book = models.ForeignKey(BookPost, on_delete=models.CASCADE, related_name='requests')
    requested_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='book_requests')
    message = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        unique_together = ['book', 'requested_by']
    
    def __str__(self):
        return f"{self.requested_by.name}'s request for {self.book.title}"
    
    def save(self, *args, **kwargs):
        if self.status == 'accepted':
            # If request is accepted, mark the book as unavailable
            self.book.is_available = False
            self.book.save()
        super().save(*args, **kwargs)

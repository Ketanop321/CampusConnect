from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from django.contrib.auth import get_user_model
from .models import BookPost, BookImage, BookRequest

User = get_user_model()

class BookPostTests(APITestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(
            email='test1@example.com',
            name='Test User 1',
            mobile='1234567890',
            password='testpass123'
        )
        self.user2 = User.objects.create_user(
            email='test2@example.com',
            name='Test User 2',
            mobile='0987654321',
            password='testpass123'
        )
        
        self.client = APIClient()
        self.client.force_authenticate(user=self.user1)
        
        self.book = BookPost.objects.create(
            title='Test Book',
            author='Test Author',
            description='Test Description',
            condition='good',
            price=100.00,
            transaction_type='sell',
            department='Computer Science',
            posted_by=self.user1,
            contact_email='test1@example.com'
        )
    
    def test_create_book_post(self):
        url = reverse('book-list')
        data = {
            'title': 'New Book',
            'author': 'New Author',
            'description': 'New Description',
            'condition': 'new',
            'price': '150.00',
            'transaction_type': 'sell',
            'department': 'Mathematics',
            'contact_email': 'test@example.com'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(BookPost.objects.count(), 2)
        self.assertEqual(BookPost.objects.get(id=response.data['id']).title, 'New Book')
    
    def test_request_book(self):
        self.client.force_authenticate(user=self.user2)
        url = reverse('book-request-book', args=[self.book.id])
        response = self.client.post(url, {'message': 'I would like to buy this book'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(BookRequest.objects.count(), 1)
        self.assertEqual(BookRequest.objects.first().status, 'pending')
    
    def test_cannot_request_own_book(self):
        url = reverse('book-request-book', args=[self.book.id])
        response = self.client.post(url, {'message': 'My own book'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_approve_book_request(self):
        # User2 requests the book
        request = BookRequest.objects.create(
            book=self.book,
            requested_by=self.user2,
            message='I want this book'
        )
        
        # User1 approves the request
        url = reverse('book-request-approve', args=[request.id])
        response = self.client.post(url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        request.refresh_from_db()
        self.book.refresh_from_db()
        
        self.assertEqual(request.status, 'accepted')
        self.assertFalse(self.book.is_available)
    
    def test_reject_book_request(self):
        # User2 requests the book
        request = BookRequest.objects.create(
            book=self.book,
            requested_by=self.user2,
            message='I want this book'
        )
        
        # User1 rejects the request
        url = reverse('book-request-reject', args=[request.id])
        response = self.client.post(url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        request.refresh_from_db()
        self.book.refresh_from_db()
        
        self.assertEqual(request.status, 'rejected')
        self.assertTrue(self.book.is_available)

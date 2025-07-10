from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from django.contrib.auth import get_user_model
from .models import LostFoundItem

User = get_user_model()

class LostFoundItemTests(APITestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(
            email='user1@example.com',
            name='User One',
            mobile='1234567890',
            password='testpass123'
        )
        self.user2 = User.objects.create_user(
            email='user2@example.com',
            name='User Two',
            mobile='0987654321',
            password='testpass123'
        )
        
        self.client = APIClient()
        self.client.force_authenticate(user=self.user1)
        
        self.item = LostFoundItem.objects.create(
            item_name='Test Item',
            description='Test Description',
            status='lost',
            location='Test Location',
            reporter=self.user1
        )
    
    def test_create_lost_item(self):
        url = reverse('lostfounditem-list')
        data = {
            'item_name': 'Lost Phone',
            'description': 'Black iPhone 13',
            'status': 'lost',
            'location': 'Library',
            'contact_info': 'user1@example.com'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(LostFoundItem.objects.count(), 2)
        self.assertEqual(LostFoundItem.objects.get(id=response.data['id']).item_name, 'Lost Phone')
    
    def test_mark_item_as_found(self):
        url = reverse('lostfounditem-mark-found', args=[self.item.id])
        response = self.client.post(url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.item.refresh_from_db()
        self.assertEqual(self.item.status, 'found')
        self.assertTrue(self.item.is_resolved)
    
    def test_claim_item(self):
        self.client.force_authenticate(user=self.user2)
        url = reverse('lostfounditem-claim', args=[self.item.id])
        response = self.client.post(url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.item.refresh_from_db()
        self.assertEqual(self.item.claimed_by, self.user2)
        self.assertTrue(self.item.is_resolved)
    
    def test_unclaim_item(self):
        # First claim the item
        self.item.claimed_by = self.user2
        self.item.save()
        
        # Try to unclaim as the wrong user (should fail)
        self.client.force_authenticate(user=self.user1)
        url = reverse('lostfounditem-unclaim', args=[self.item.id])
        response = self.client.post(url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # Unclaim as the correct user
        self.client.force_authenticate(user=self.user2)
        response = self.client.post(url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.item.refresh_from_db()
        self.assertIsNone(self.item.claimed_by)
        self.assertFalse(self.item.is_resolved)
    
    def test_filter_items_by_status(self):
        # Create a found item
        LostFoundItem.objects.create(
            item_name='Found Item',
            description='Found in the library',
            status='found',
            location='Library',
            reporter=self.user1
        )
        
        # Test filtering by status
        url = f"{reverse('lostfounditem-list')}?status=found"
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['item_name'], 'Found Item')
    
    def test_update_item(self):
        url = reverse('lostfounditem-detail', args=[self.item.id])
        data = {
            'item_name': 'Updated Item Name',
            'description': 'Updated description',
            'status': 'found'
        }
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.item.refresh_from_db()
        self.assertEqual(self.item.item_name, 'Updated Item Name')
        self.assertEqual(self.item.status, 'found')
    
    def test_delete_item(self):
        url = reverse('lostfounditem-detail', args=[self.item.id])
        response = self.client.delete(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(LostFoundItem.objects.count(), 0)
    
    def test_unauthorized_access(self):
        # Test unauthenticated access
        self.client.force_authenticate(user=None)
        url = reverse('lostfounditem-list')
        response = self.client.get(url, format='json')
        # Should be allowed for read operations
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Try to create an item unauthenticated
        data = {
            'item_name': 'Unauthorized Item',
            'status': 'lost'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

class LostFoundModelTests(TestCase):
    def test_item_creation(self):
        user = User.objects.create_user(
            email='test@example.com',
            name='Test User',
            mobile='1234567890',
            password='testpass123'
        )
        item = LostFoundItem.objects.create(
            item_name='Test Item',
            status='lost',
            reporter=user,
            location='Test Location'
        )
        self.assertEqual(str(item), 'Test Item (lost)')
        self.assertEqual(item.reporter, user)
        self.assertFalse(item.is_resolved)

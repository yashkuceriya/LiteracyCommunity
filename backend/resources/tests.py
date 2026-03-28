from django.test import TestCase, Client
from accounts.models import User
from .models import Resource


class ResourceTests(TestCase):

    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(username='alice', email='a@test.com', password='pass1234')
        self.other = User.objects.create_user(username='bob', email='b@test.com', password='pass1234')
        self.mod = User.objects.create_user(username='mod', email='mod@test.com', password='pass1234', role='moderator')

    def _create_resource(self, user=None):
        user = user or self.user
        return Resource.objects.create(
            title='Science of Reading Guide', description='A comprehensive guide.',
            url='https://example.com/guide', resource_type='guide', author=user,
        )

    def test_create_resource(self):
        self.client.login(username='alice', password='pass1234')
        resp = self.client.post('/api/resources/', {
            'title': 'New Resource', 'description': 'Great resource.',
            'resource_type': 'article',
        }, content_type='application/json')
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(Resource.objects.count(), 1)

    def test_list_resources(self):
        self._create_resource()
        self.client.login(username='alice', password='pass1234')
        resp = self.client.get('/api/resources/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.json()), 1)

    def test_toggle_upvote(self):
        resource = self._create_resource()
        self.client.login(username='bob', password='pass1234')

        # Upvote
        resp = self.client.post(f'/api/resources/{resource.pk}/upvote/')
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp.json()['upvoted'])
        self.assertEqual(resp.json()['upvote_count'], 1)

        # Un-upvote
        resp = self.client.post(f'/api/resources/{resource.pk}/upvote/')
        self.assertFalse(resp.json()['upvoted'])
        self.assertEqual(resp.json()['upvote_count'], 0)

    def test_delete_own_resource(self):
        resource = self._create_resource()
        self.client.login(username='alice', password='pass1234')
        resp = self.client.delete(f'/api/resources/{resource.pk}/')
        self.assertEqual(resp.status_code, 204)
        self.assertEqual(Resource.objects.count(), 0)

    def test_cannot_delete_others_resource(self):
        resource = self._create_resource(user=self.user)
        self.client.login(username='bob', password='pass1234')
        resp = self.client.delete(f'/api/resources/{resource.pk}/')
        self.assertEqual(resp.status_code, 403)

    def test_moderator_can_delete_any_resource(self):
        resource = self._create_resource(user=self.user)
        self.client.login(username='mod', password='pass1234')
        resp = self.client.delete(f'/api/resources/{resource.pk}/')
        self.assertEqual(resp.status_code, 204)

    def test_requires_auth(self):
        resp = self.client.get('/api/resources/')
        self.assertEqual(resp.status_code, 403)

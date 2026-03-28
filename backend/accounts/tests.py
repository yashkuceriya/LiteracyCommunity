from django.test import TestCase, Client
from .models import User


class AuthTestCase(TestCase):

    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(
            username='testuser', email='test@example.com', password='testpass123',
            first_name='Test', last_name='User',
        )

    def _register(self, **overrides):
        data = {
            'username': 'newuser', 'email': 'new@example.com',
            'password': 'newpass123', 'password2': 'newpass123',
            'first_name': 'New', 'last_name': 'User',
        }
        data.update(overrides)
        return self.client.post('/api/auth/register/', data, content_type='application/json')

    def test_register_creates_user(self):
        resp = self._register()
        self.assertEqual(resp.status_code, 201)
        self.assertTrue(User.objects.filter(username='newuser').exists())

    def test_register_auto_logs_in(self):
        resp = self._register()
        self.assertEqual(resp.status_code, 201)
        # Session should be active — me endpoint should work
        me = self.client.get('/api/auth/me/')
        self.assertEqual(me.status_code, 200)
        self.assertEqual(me.json()['username'], 'newuser')

    def test_register_password_mismatch(self):
        resp = self._register(password2='wrongpass')
        self.assertEqual(resp.status_code, 400)

    def test_register_short_password(self):
        resp = self._register(password='short', password2='short')
        self.assertEqual(resp.status_code, 400)

    def test_login_valid(self):
        resp = self.client.post('/api/auth/login/', {'username': 'testuser', 'password': 'testpass123'}, content_type='application/json')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()['username'], 'testuser')

    def test_login_invalid(self):
        resp = self.client.post('/api/auth/login/', {'username': 'testuser', 'password': 'wrong'}, content_type='application/json')
        self.assertEqual(resp.status_code, 401)

    def test_login_suspended_user(self):
        self.user.is_active = False
        self.user.save()
        resp = self.client.post('/api/auth/login/', {'username': 'testuser', 'password': 'testpass123'}, content_type='application/json')
        # Django's authenticate returns None for inactive users
        self.assertIn(resp.status_code, [401, 403])

    def test_me_requires_auth(self):
        resp = self.client.get('/api/auth/me/')
        self.assertEqual(resp.status_code, 403)

    def test_me_returns_user_data(self):
        self.client.login(username='testuser', password='testpass123')
        resp = self.client.get('/api/auth/me/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()['email'], 'test@example.com')

    def test_change_password(self):
        self.client.login(username='testuser', password='testpass123')
        resp = self.client.post('/api/auth/change-password/', {
            'current_password': 'testpass123',
            'new_password': 'newpass456',
            'confirm_password': 'newpass456',
        }, content_type='application/json')
        self.assertEqual(resp.status_code, 200)
        # Old password should no longer work
        self.client.logout()
        self.assertFalse(self.client.login(username='testuser', password='testpass123'))
        self.assertTrue(self.client.login(username='testuser', password='newpass456'))

    def test_change_password_wrong_current(self):
        self.client.login(username='testuser', password='testpass123')
        resp = self.client.post('/api/auth/change-password/', {
            'current_password': 'wrongpass',
            'new_password': 'newpass456',
            'confirm_password': 'newpass456',
        }, content_type='application/json')
        self.assertEqual(resp.status_code, 400)

    def test_logout(self):
        self.client.login(username='testuser', password='testpass123')
        resp = self.client.post('/api/auth/logout/')
        self.assertEqual(resp.status_code, 200)
        me = self.client.get('/api/auth/me/')
        self.assertEqual(me.status_code, 403)

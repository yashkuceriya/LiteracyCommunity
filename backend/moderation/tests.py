from django.test import TestCase, Client
from accounts.models import User
from messaging.models import Conversation, Message
from .models import FlaggedMessage, ModerationAction


class ModerationTests(TestCase):

    def setUp(self):
        self.client = Client()
        self.member = User.objects.create_user(username='member', email='m@test.com', password='pass1234')
        self.mod = User.objects.create_user(username='mod', email='mod@test.com', password='pass1234', role='moderator')
        self.target = User.objects.create_user(username='target', email='t@test.com', password='pass1234')

        self.conv = Conversation.objects.create()
        self.conv.participants.add(self.member, self.target)
        self.msg = Message.objects.create(conversation=self.conv, sender=self.target, content='Bad message')

    def test_flag_message(self):
        self.client.login(username='member', password='pass1234')
        resp = self.client.post('/api/moderation/flag/', {
            'message_id': self.msg.pk, 'reason': 'Inappropriate content',
        }, content_type='application/json')
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(FlaggedMessage.objects.count(), 1)

    def test_flag_requires_reason(self):
        self.client.login(username='member', password='pass1234')
        resp = self.client.post('/api/moderation/flag/', {
            'message_id': self.msg.pk, 'reason': '',
        }, content_type='application/json')
        self.assertEqual(resp.status_code, 400)

    def test_flagged_list_requires_moderator(self):
        self.client.login(username='member', password='pass1234')
        resp = self.client.get('/api/moderation/flagged/')
        self.assertEqual(resp.status_code, 403)

    def test_moderator_can_review_flag(self):
        flag = FlaggedMessage.objects.create(message=self.msg, flagged_by=self.member, reason='Spam')
        self.client.login(username='mod', password='pass1234')
        resp = self.client.post(f'/api/moderation/flagged/{flag.pk}/review/', {
            'status': 'reviewed', 'moderator_notes': 'Confirmed violation',
        }, content_type='application/json')
        self.assertEqual(resp.status_code, 200)
        flag.refresh_from_db()
        self.assertEqual(flag.status, 'reviewed')
        self.assertEqual(flag.reviewed_by, self.mod)

    def test_suspend_user(self):
        self.client.login(username='mod', password='pass1234')
        resp = self.client.post(f'/api/moderation/users/{self.target.pk}/action/', {
            'action': 'suspend', 'reason': 'Repeated violations',
        }, content_type='application/json')
        self.assertEqual(resp.status_code, 201)
        self.target.refresh_from_db()
        self.assertFalse(self.target.is_active)

    def test_unsuspend_user(self):
        self.target.is_active = False
        self.target.save()
        self.client.login(username='mod', password='pass1234')
        resp = self.client.post(f'/api/moderation/users/{self.target.pk}/action/', {
            'action': 'unsuspend', 'reason': 'Appeal approved',
        }, content_type='application/json')
        self.assertEqual(resp.status_code, 201)
        self.target.refresh_from_db()
        self.assertTrue(self.target.is_active)

    def test_member_cannot_take_action(self):
        self.client.login(username='member', password='pass1234')
        resp = self.client.post(f'/api/moderation/users/{self.target.pk}/action/', {
            'action': 'warn', 'reason': 'Trying to hack',
        }, content_type='application/json')
        self.assertEqual(resp.status_code, 403)

    def test_non_participant_cannot_flag_message(self):
        """Users can only flag messages in conversations they belong to."""
        outsider = User.objects.create_user(username='outsider', email='o@test.com', password='pass1234')
        self.client.login(username='outsider', password='pass1234')
        resp = self.client.post('/api/moderation/flag/', {
            'message_id': self.msg.pk, 'reason': 'Spam',
        }, content_type='application/json')
        self.assertEqual(resp.status_code, 403)

    def test_cannot_action_self(self):
        """Moderators cannot take action on themselves."""
        self.client.login(username='mod', password='pass1234')
        resp = self.client.post(f'/api/moderation/users/{self.mod.pk}/action/', {
            'action': 'warn', 'reason': 'Testing self',
        }, content_type='application/json')
        self.assertEqual(resp.status_code, 400)

    def test_cannot_action_admin(self):
        """Moderators cannot take action on admins."""
        admin = User.objects.create_user(username='admin', email='a@test.com', password='pass1234', role='admin')
        self.client.login(username='mod', password='pass1234')
        resp = self.client.post(f'/api/moderation/users/{admin.pk}/action/', {
            'action': 'warn', 'reason': 'Testing hierarchy',
        }, content_type='application/json')
        self.assertEqual(resp.status_code, 403)

    def test_moderator_cannot_action_other_moderator(self):
        """Moderators cannot take action on other moderators (only admins can)."""
        mod2 = User.objects.create_user(username='mod2', email='m2@test.com', password='pass1234', role='moderator')
        self.client.login(username='mod', password='pass1234')
        resp = self.client.post(f'/api/moderation/users/{mod2.pk}/action/', {
            'action': 'warn', 'reason': 'Testing hierarchy',
        }, content_type='application/json')
        self.assertEqual(resp.status_code, 403)

    def test_admin_can_action_moderator(self):
        """Admins can take action on moderators."""
        admin = User.objects.create_user(username='admin', email='a@test.com', password='pass1234', role='admin')
        self.client.login(username='admin', password='pass1234')
        resp = self.client.post(f'/api/moderation/users/{self.mod.pk}/action/', {
            'action': 'warn', 'reason': 'Policy violation',
        }, content_type='application/json')
        self.assertEqual(resp.status_code, 201)

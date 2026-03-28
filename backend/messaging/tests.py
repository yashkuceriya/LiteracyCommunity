from django.test import TestCase, Client
from accounts.models import User
from .models import Conversation, Message


class MessagingTests(TestCase):

    def setUp(self):
        self.client = Client()
        self.user1 = User.objects.create_user(username='alice', email='alice@test.com', password='pass1234', first_name='Alice', last_name='Smith')
        self.user2 = User.objects.create_user(username='bob', email='bob@test.com', password='pass1234', first_name='Bob', last_name='Jones')
        self.mod = User.objects.create_user(username='mod', email='mod@test.com', password='pass1234', role='moderator')

    def test_create_conversation(self):
        self.client.login(username='alice', password='pass1234')
        resp = self.client.post('/api/messaging/conversations/', {'recipient_id': self.user2.pk}, content_type='application/json')
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(Conversation.objects.count(), 1)

    def test_cannot_message_self(self):
        self.client.login(username='alice', password='pass1234')
        resp = self.client.post('/api/messaging/conversations/', {'recipient_id': self.user1.pk}, content_type='application/json')
        self.assertEqual(resp.status_code, 400)

    def test_resume_existing_conversation(self):
        self.client.login(username='alice', password='pass1234')
        resp1 = self.client.post('/api/messaging/conversations/', {'recipient_id': self.user2.pk}, content_type='application/json')
        resp2 = self.client.post('/api/messaging/conversations/', {'recipient_id': self.user2.pk}, content_type='application/json')
        self.assertEqual(resp1.json()['id'], resp2.json()['id'])
        self.assertEqual(Conversation.objects.count(), 1)

    def test_send_message(self):
        self.client.login(username='alice', password='pass1234')
        resp = self.client.post('/api/messaging/conversations/', {'recipient_id': self.user2.pk}, content_type='application/json')
        conv_id = resp.json()['id']
        msg_resp = self.client.post(f'/api/messaging/conversations/{conv_id}/messages/', {'content': 'Hello Bob!'}, content_type='application/json')
        self.assertEqual(msg_resp.status_code, 201)
        self.assertEqual(Message.objects.count(), 1)
        self.assertEqual(Message.objects.first().content, 'Hello Bob!')

    def test_empty_message_rejected(self):
        self.client.login(username='alice', password='pass1234')
        conv = Conversation.objects.create()
        conv.participants.add(self.user1, self.user2)
        resp = self.client.post(f'/api/messaging/conversations/{conv.pk}/messages/', {'content': '   '}, content_type='application/json')
        self.assertEqual(resp.status_code, 400)

    def test_unread_count(self):
        self.client.login(username='alice', password='pass1234')
        conv = Conversation.objects.create()
        conv.participants.add(self.user1, self.user2)
        Message.objects.create(conversation=conv, sender=self.user2, content='Hey')
        Message.objects.create(conversation=conv, sender=self.user2, content='You there?')
        resp = self.client.get('/api/messaging/unread-count/')
        self.assertEqual(resp.json()['unread_count'], 2)

    def test_conversation_requires_auth(self):
        resp = self.client.get('/api/messaging/conversations/')
        self.assertEqual(resp.status_code, 403)

    def test_moderator_can_view_any_conversation(self):
        conv = Conversation.objects.create()
        conv.participants.add(self.user1, self.user2)
        Message.objects.create(conversation=conv, sender=self.user1, content='Private message')
        self.client.login(username='mod', password='pass1234')
        resp = self.client.get(f'/api/messaging/conversations/{conv.pk}/')
        self.assertEqual(resp.status_code, 200)

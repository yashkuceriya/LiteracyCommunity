from django.test import TestCase
from accounts.models import User
from .models import District, ProblemStatement, MemberProfile
from .matching import calculate_match_score, find_matches


class MatchingTestMixin:
    """Shared setup for matching algorithm tests."""

    def setUp(self):
        self.ps1 = ProblemStatement.objects.create(title='Science of Reading', category='curriculum')
        self.ps2 = ProblemStatement.objects.create(title='ELL Support', category='equity')
        self.ps3 = ProblemStatement.objects.create(title='Data-Driven Decisions', category='assessment')
        self.ps4 = ProblemStatement.objects.create(title='Teacher Coaching', category='professional_dev')

        self.district_a = District.objects.create(
            name='Springfield', state='IL', district_type='urban',
            size_category='large', enrollment=15000,
            free_reduced_lunch_pct=45.0, esl_pct=12.0,
        )
        self.district_b = District.objects.create(
            name='Shelbyville', state='IL', district_type='urban',
            size_category='large', enrollment=14000,
            free_reduced_lunch_pct=45.0, esl_pct=12.0,
        )
        self.district_c = District.objects.create(
            name='Capital City', state='TX', district_type='rural',
            size_category='small', enrollment=800,
            free_reduced_lunch_pct=80.0, esl_pct=5.0,
        )

    def _make_profile(self, username, district=None, problems=None):
        user = User.objects.create_user(username=username, email=f'{username}@test.com', password='testpass123')
        profile = MemberProfile.objects.create(user=user, district=district, is_public=True)
        if problems:
            profile.problem_statements.set(problems)
        return profile


class CalculateMatchScoreTests(MatchingTestMixin, TestCase):

    def test_perfect_match(self):
        """Two profiles with identical districts and all shared problems score 100."""
        p1 = self._make_profile('user1', self.district_a, [self.ps1, self.ps2, self.ps3])
        p2 = self._make_profile('user2', self.district_b, [self.ps1, self.ps2, self.ps3])
        score, breakdown = calculate_match_score(p1, p2)
        # 45 (3 shared) + 15 (type) + 15 (size) + 10 (FRL) + 10 (ESL) + 5 (state) = 100
        self.assertEqual(score, 100)

    def test_no_overlap(self):
        """Completely different districts and no shared problems score low."""
        p1 = self._make_profile('user1', self.district_a, [self.ps1])
        p2 = self._make_profile('user2', self.district_c, [self.ps2])
        score, breakdown = calculate_match_score(p1, p2)
        self.assertLessEqual(score, 20)
        self.assertEqual(breakdown['shared_problems']['score'], 0)

    def test_shared_problems_one(self):
        """One shared problem = 15 pts."""
        p1 = self._make_profile('user1', problems=[self.ps1, self.ps2])
        p2 = self._make_profile('user2', problems=[self.ps1, self.ps3])
        score, breakdown = calculate_match_score(p1, p2)
        self.assertEqual(breakdown['shared_problems']['score'], 15)
        self.assertEqual(breakdown['shared_problems']['count'], 1)

    def test_shared_problems_two(self):
        """Two shared problems = 30 pts."""
        p1 = self._make_profile('user1', problems=[self.ps1, self.ps2])
        p2 = self._make_profile('user2', problems=[self.ps1, self.ps2])
        score, breakdown = calculate_match_score(p1, p2)
        self.assertEqual(breakdown['shared_problems']['score'], 30)

    def test_shared_problems_capped_at_45(self):
        """Shared problems capped at 45 even with 4+ shared."""
        p1 = self._make_profile('user1', problems=[self.ps1, self.ps2, self.ps3, self.ps4])
        p2 = self._make_profile('user2', problems=[self.ps1, self.ps2, self.ps3, self.ps4])
        score, breakdown = calculate_match_score(p1, p2)
        self.assertEqual(breakdown['shared_problems']['score'], 45)

    def test_district_type_match(self):
        """Same district type = +15."""
        p1 = self._make_profile('user1', self.district_a)
        p2 = self._make_profile('user2', self.district_b)
        _, breakdown = calculate_match_score(p1, p2)
        self.assertEqual(breakdown['district_type']['score'], 15)

    def test_district_type_mismatch(self):
        """Different district type = +0."""
        p1 = self._make_profile('user1', self.district_a)
        p2 = self._make_profile('user2', self.district_c)
        _, breakdown = calculate_match_score(p1, p2)
        self.assertEqual(breakdown['district_type']['score'], 0)

    def test_district_size_same(self):
        """Same size = +15."""
        p1 = self._make_profile('user1', self.district_a)  # large
        p2 = self._make_profile('user2', self.district_b)  # large
        _, breakdown = calculate_match_score(p1, p2)
        self.assertEqual(breakdown['district_size']['score'], 15)

    def test_district_size_far_apart(self):
        """Large vs small (2 steps) = +5."""
        p1 = self._make_profile('user1', self.district_a)  # large
        p2 = self._make_profile('user2', self.district_c)  # small
        _, breakdown = calculate_match_score(p1, p2)
        self.assertEqual(breakdown['district_size']['score'], 5)

    def test_frl_similarity_identical(self):
        """Identical FRL% = +10."""
        p1 = self._make_profile('user1', self.district_a)  # 45%
        p2 = self._make_profile('user2', self.district_b)  # 45%
        _, breakdown = calculate_match_score(p1, p2)
        self.assertEqual(breakdown['free_reduced_lunch']['score'], 10)

    def test_frl_large_difference(self):
        """FRL diff of 35% = low score."""
        p1 = self._make_profile('user1', self.district_a)  # 45%
        p2 = self._make_profile('user2', self.district_c)  # 80%
        _, breakdown = calculate_match_score(p1, p2)
        self.assertLessEqual(breakdown['free_reduced_lunch']['score'], 3)

    def test_esl_similarity(self):
        """Identical ESL% = +10."""
        p1 = self._make_profile('user1', self.district_a)  # 12%
        p2 = self._make_profile('user2', self.district_b)  # 12%
        _, breakdown = calculate_match_score(p1, p2)
        self.assertEqual(breakdown['esl']['score'], 10)

    def test_same_state_bonus(self):
        """Same state = +5."""
        p1 = self._make_profile('user1', self.district_a)  # IL
        p2 = self._make_profile('user2', self.district_b)  # IL
        _, breakdown = calculate_match_score(p1, p2)
        self.assertEqual(breakdown['same_state']['score'], 5)

    def test_different_state(self):
        """Different state = +0."""
        p1 = self._make_profile('user1', self.district_a)  # IL
        p2 = self._make_profile('user2', self.district_c)  # TX
        _, breakdown = calculate_match_score(p1, p2)
        self.assertEqual(breakdown['same_state']['score'], 0)

    def test_no_district_handles_gracefully(self):
        """Profile without a district doesn't crash."""
        p1 = self._make_profile('user1', problems=[self.ps1])
        p2 = self._make_profile('user2', problems=[self.ps1])
        score, breakdown = calculate_match_score(p1, p2)
        self.assertEqual(score, 15)  # only shared problems count
        self.assertNotIn('district_type', breakdown)


class FindMatchesTests(MatchingTestMixin, TestCase):

    def test_excludes_self(self):
        """find_matches never returns the requesting profile."""
        p1 = self._make_profile('user1', self.district_a, [self.ps1])
        self._make_profile('user2', self.district_b, [self.ps1])
        results = find_matches(p1)
        profile_ids = [p.pk for p, _, _ in results]
        self.assertNotIn(p1.pk, profile_ids)

    def test_min_score_filter(self):
        """Results below min_score are excluded."""
        p1 = self._make_profile('user1', self.district_a, [self.ps1])
        self._make_profile('user2', self.district_c, [self.ps2])  # low match
        results = find_matches(p1, min_score=50)
        self.assertEqual(len(results), 0)

    def test_sorted_descending(self):
        """Results are sorted by score descending."""
        p1 = self._make_profile('user1', self.district_a, [self.ps1, self.ps2, self.ps3])
        self._make_profile('user2', self.district_b, [self.ps1, self.ps2, self.ps3])  # high match
        self._make_profile('user3', self.district_c, [self.ps1])  # low match
        results = find_matches(p1, min_score=0)
        scores = [s for _, s, _ in results]
        self.assertEqual(scores, sorted(scores, reverse=True))

    def test_excludes_inactive_users(self):
        """Inactive users are excluded from matches."""
        p1 = self._make_profile('user1', self.district_a, [self.ps1])
        p2 = self._make_profile('user2', self.district_b, [self.ps1])
        p2.user.is_active = False
        p2.user.save()
        results = find_matches(p1, min_score=0)
        self.assertEqual(len(results), 0)

"""
Matching algorithm for literacy community members.

Scores members on a 0–100 scale based on:
- Shared problem statements (up to 45 pts — most important)
- District type match (15 pts)
- Similar district size (up to 15 pts)
- Similar Free/Reduced Lunch % (up to 10 pts)
- Similar ESL % (up to 10 pts)
- Same state (5 pts)
"""

SIZE_ORDER = ['small', 'medium', 'large', 'very_large']


def calculate_match_score(profile1, profile2):
    score = 0
    breakdown = {}

    # --- Shared problem statements (most heavily weighted) ---
    ps1 = set(profile1.problem_statements.values_list('id', flat=True))
    ps2 = set(profile2.problem_statements.values_list('id', flat=True))
    shared = ps1 & ps2
    ps_score = min(len(shared) * 15, 45)
    score += ps_score
    breakdown['shared_problems'] = {'score': ps_score, 'count': len(shared)}

    d1 = profile1.district
    d2 = profile2.district

    if d1 and d2:
        # District type
        if d1.district_type == d2.district_type:
            score += 15
            breakdown['district_type'] = {'score': 15, 'match': True}
        else:
            breakdown['district_type'] = {'score': 0, 'match': False}

        # District size (closer = higher score)
        if d1.size_category in SIZE_ORDER and d2.size_category in SIZE_ORDER:
            diff = abs(SIZE_ORDER.index(d1.size_category) - SIZE_ORDER.index(d2.size_category))
            size_score = max(0, 15 - diff * 5)
        else:
            size_score = 0
        score += size_score
        breakdown['district_size'] = {'score': size_score}

        # Free/Reduced Lunch %
        frl_diff = abs(float(d1.free_reduced_lunch_pct or 0) - float(d2.free_reduced_lunch_pct or 0))
        frl_score = max(0, int(10 - frl_diff / 5))
        score += frl_score
        breakdown['free_reduced_lunch'] = {'score': frl_score, 'diff': round(frl_diff, 1)}

        # ESL %
        esl_diff = abs(float(d1.esl_pct or 0) - float(d2.esl_pct or 0))
        esl_score = max(0, int(10 - esl_diff / 5))
        score += esl_score
        breakdown['esl'] = {'score': esl_score, 'diff': round(esl_diff, 1)}

        # Same state
        if d1.state == d2.state:
            score += 5
            breakdown['same_state'] = {'score': 5, 'match': True}
        else:
            breakdown['same_state'] = {'score': 0, 'match': False}

    # Normalize to 0–100
    normalized = min(score, 100)
    return normalized, breakdown


def find_matches(profile, queryset=None, min_score=10):
    """Return a list of (profile, score, breakdown) sorted by score descending."""
    from .models import MemberProfile

    if queryset is None:
        queryset = MemberProfile.objects.filter(is_public=True, user__is_active=True).exclude(pk=profile.pk)
    else:
        queryset = queryset.filter(user__is_active=True).exclude(pk=profile.pk)

    queryset = queryset.select_related('district', 'user').prefetch_related('problem_statements')

    results = []
    for other in queryset:
        score, breakdown = calculate_match_score(profile, other)
        if score >= min_score:
            results.append((other, score, breakdown))

    results.sort(key=lambda x: x[1], reverse=True)
    return results

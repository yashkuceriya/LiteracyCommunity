"""
Seeds the database with:
- 20 problem statements across 5 categories
- 40 sample school districts with realistic demographic data
- Sample users and profiles for demo purposes
"""
from django.core.management.base import BaseCommand
from community.models import District, ProblemStatement, MemberProfile
from accounts.models import User


PROBLEM_STATEMENTS = [
    # Curriculum & Instruction
    ('curriculum', 'Implementing Science of Reading aligned curriculum',
     'Transitioning to structured literacy and phonics-based instruction aligned with the science of reading.'),
    ('curriculum', 'Phonics and phonemic awareness instruction gaps',
     'Addressing gaps in foundational literacy skills instruction, particularly systematic phonics.'),
    ('curriculum', 'Selecting and adopting new literacy curriculum materials',
     'Evaluating and choosing evidence-based curriculum materials for district-wide adoption.'),
    ('curriculum', 'Aligning literacy instruction across grade levels K-8',
     'Creating vertical alignment and consistency in literacy instruction from kindergarten through 8th grade.'),
    ('curriculum', 'Integrating literacy across content areas',
     'Building reading and writing skills across science, social studies, and other subjects.'),

    # Assessment & Data
    ('assessment', 'Establishing universal literacy screening systems',
     'Implementing early and universal screening to identify students at risk for reading difficulties.'),
    ('assessment', 'Using assessment data to drive instruction',
     'Building capacity to analyze literacy assessment data and translate it into instructional decisions.'),
    ('assessment', 'Identifying and closing post-pandemic reading gaps',
     'Assessing and addressing the learning loss in reading that occurred during COVID-19.'),
    ('assessment', 'Early identification of reading difficulties and dyslexia',
     'Establishing systematic screening and intervention protocols for dyslexia and reading disabilities.'),

    # Professional Development
    ('professional_dev', 'Building teacher capacity in structured literacy',
     'Training teachers in the science of reading, structured literacy methods, and evidence-based practices.'),
    ('professional_dev', 'Developing effective literacy coaching programs',
     'Creating and sustaining instructional coaching models that improve classroom literacy instruction.'),
    ('professional_dev', 'Training staff on new curriculum implementations',
     'Providing professional development to support the rollout of new literacy curricula.'),

    # Equity & Access
    ('equity', 'Supporting English Language Learners in literacy',
     'Developing effective literacy strategies for multilingual learners and ELL students.'),
    ('equity', 'Addressing literacy needs in special education',
     'Ensuring students with disabilities receive evidence-based literacy instruction and intervention.'),
    ('equity', 'Closing achievement gaps in underserved populations',
     'Targeting literacy improvement efforts to reduce disparities for historically underserved students.'),
    ('equity', 'Improving family and community literacy engagement',
     'Building partnerships with families and community organizations to support student literacy at home.'),

    # Leadership & Culture
    ('leadership', 'Building a district-wide culture of reading',
     'Creating a shared vision and culture that prioritizes literacy achievement across the district.'),
    ('leadership', 'Securing funding and resources for literacy programs',
     'Identifying grants, budgeting strategies, and resource allocation for sustained literacy investment.'),
    ('leadership', 'Sustaining literacy initiatives through leadership transitions',
     'Ensuring continuity of literacy improvement efforts despite turnover in district and school leadership.'),
    ('leadership', 'Measuring and communicating literacy program effectiveness',
     'Developing metrics, dashboards, and communication strategies to track and share literacy outcomes.'),
]

DISTRICTS = [
    # Urban districts
    ('Chicago Public Schools', 'IL', 'urban', 'very_large', 321000, 77.0, 19.5),
    ('Houston ISD', 'TX', 'urban', 'very_large', 194000, 80.2, 33.1),
    ('Philadelphia City SD', 'PA', 'urban', 'very_large', 115000, 73.5, 11.2),
    ('Detroit Public Schools', 'MI', 'urban', 'very_large', 49000, 86.0, 12.8),
    ('Atlanta Public Schools', 'GA', 'urban', 'large', 49500, 70.3, 8.4),
    ('Boston Public Schools', 'MA', 'urban', 'large', 47500, 62.1, 22.7),
    ('Denver Public Schools', 'CO', 'urban', 'large', 89000, 61.8, 29.4),
    ('Memphis-Shelby County Schools', 'TN', 'urban', 'very_large', 101000, 78.0, 7.6),
    ('Baltimore City Public Schools', 'MD', 'urban', 'large', 75000, 81.2, 5.9),
    ('Oakland USD', 'CA', 'urban', 'large', 34000, 71.9, 28.3),

    # Suburban districts
    ('Fairfax County Public Schools', 'VA', 'suburban', 'very_large', 179000, 33.4, 26.8),
    ('Montgomery County Public Schools', 'MD', 'suburban', 'very_large', 160000, 36.2, 21.5),
    ('Gwinnett County Public Schools', 'GA', 'suburban', 'very_large', 180000, 53.1, 20.9),
    ('Plano ISD', 'TX', 'suburban', 'large', 51000, 28.3, 15.6),
    ('Cherry Creek School District', 'CO', 'suburban', 'large', 54000, 22.7, 12.1),
    ('Naperville CUSD 203', 'IL', 'suburban', 'large', 17000, 11.4, 9.8),
    ('Loudoun County Public Schools', 'VA', 'suburban', 'large', 83000, 17.6, 18.2),
    ('Cobb County School District', 'GA', 'suburban', 'very_large', 107000, 42.8, 11.7),
    ('Howard County Public Schools', 'MD', 'suburban', 'large', 57000, 24.1, 8.6),
    ('Wake County Public Schools', 'NC', 'suburban', 'very_large', 160000, 35.8, 13.2),

    # Rural districts
    ('Yazoo City Municipal SD', 'MS', 'rural', 'small', 900, 95.2, 1.1),
    ('Holmes County Consolidated SD', 'MS', 'rural', 'medium', 2800, 97.1, 0.8),
    ('Pine Ridge School District', 'SD', 'rural', 'small', 700, 92.0, 0.5),
    ('Appalachian Regional SD', 'WV', 'rural', 'medium', 3200, 78.4, 1.2),
    ('Blackfoot School District', 'ID', 'rural', 'medium', 3800, 55.2, 15.3),
    ('Lee County Schools', 'AR', 'rural', 'small', 650, 88.7, 2.4),
    ('Sunflower County Consolidated', 'MS', 'rural', 'medium', 1800, 94.3, 0.7),
    ('Breathitt County Schools', 'KY', 'rural', 'medium', 1600, 82.1, 0.3),
    ('Neshoba County School District', 'MS', 'rural', 'medium', 2500, 72.6, 1.8),
    ('Wilcox County Schools', 'AL', 'rural', 'small', 950, 91.0, 0.6),

    # Town districts
    ('Pueblo City Schools', 'CO', 'town', 'large', 16000, 72.5, 18.2),
    ('Abilene ISD', 'TX', 'town', 'large', 15000, 64.8, 12.7),
    ('Bangor School Department', 'ME', 'town', 'medium', 3600, 52.0, 6.1),
    ('Joplin Schools', 'MO', 'town', 'large', 7300, 63.4, 8.9),
    ('Garden City USD 457', 'KS', 'town', 'large', 7200, 73.6, 39.4),
    ('Dalton Public Schools', 'GA', 'town', 'large', 7500, 76.2, 32.1),
    ('Lewiston School Department', 'ME', 'town', 'medium', 4200, 68.3, 18.5),
    ('Dodge City USD 443', 'KS', 'town', 'medium', 5000, 78.9, 41.2),
    ('Marshalltown CSD', 'IA', 'town', 'medium', 4800, 64.7, 22.8),
    ('Worthington Public Schools', 'MN', 'town', 'medium', 3200, 59.3, 35.6),
]

SAMPLE_USERS = [
    ('sarah_chen', 'sarah@example.com', 'Sarah', 'Chen', 'Director of Curriculum', 0, [0, 1, 5, 9], 12),
    ('marcus_j', 'marcus@example.com', 'Marcus', 'Johnson', 'Superintendent', 1, [3, 7, 16, 17], 22),
    ('elena_r', 'elena@example.com', 'Elena', 'Rodriguez', 'Literacy Coach', 2, [0, 9, 10, 12], 8),
    ('david_w', 'david@example.com', 'David', 'Williams', 'Principal', 3, [6, 7, 14, 19], 15),
    ('amanda_t', 'amanda@example.com', 'Amanda', 'Thompson', 'Reading Specialist', 4, [1, 5, 8, 13], 10),
    ('james_p', 'james@example.com', 'James', 'Patterson', 'Asst. Superintendent', 5, [2, 11, 17, 18], 18),
    ('lisa_k', 'lisa@example.com', 'Lisa', 'Kim', 'Curriculum Coordinator', 10, [0, 2, 9, 10], 7),
    ('robert_m', 'robert@example.com', 'Robert', 'Martinez', 'Superintendent', 20, [7, 14, 16, 18], 25),
    ('jennifer_d', 'jennifer@example.com', 'Jennifer', 'Davis', 'Literacy Director', 25, [3, 6, 12, 15], 14),
    ('michael_b', 'michael@example.com', 'Michael', 'Brown', 'Title I Coordinator', 30, [7, 14, 15, 17], 11),
    ('moderator', 'mod@example.com', 'Admin', 'Moderator', 'Community Moderator', 0, [], 0),
]


class Command(BaseCommand):
    help = 'Seed database with problem statements, districts, and sample users'

    def handle(self, *args, **options):
        self.stdout.write('Seeding problem statements...')
        ps_objects = []
        for cat, title, desc in PROBLEM_STATEMENTS:
            obj, _ = ProblemStatement.objects.get_or_create(
                title=title, defaults={'category': cat, 'description': desc}
            )
            ps_objects.append(obj)
        self.stdout.write(self.style.SUCCESS(f'  {len(ps_objects)} problem statements'))

        self.stdout.write('Seeding districts...')
        dist_objects = []
        for i, (name, state, dtype, size, enroll, frl, esl) in enumerate(DISTRICTS):
            obj, _ = District.objects.get_or_create(
                name=name, state=state,
                defaults={
                    'nces_id': f'NCES-{i+1:04d}',
                    'district_type': dtype,
                    'size_category': size,
                    'enrollment': enroll,
                    'free_reduced_lunch_pct': frl,
                    'esl_pct': esl,
                }
            )
            dist_objects.append(obj)
        self.stdout.write(self.style.SUCCESS(f'  {len(dist_objects)} districts'))

        self.stdout.write('Seeding sample users and profiles...')
        for username, email, first, last, title, dist_idx, ps_idxs, years in SAMPLE_USERS:
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    'email': email, 'first_name': first, 'last_name': last,
                    'role': 'moderator' if username == 'moderator' else 'member',
                }
            )
            if created:
                user.set_password('password123')
                user.save()

            if username == 'moderator':
                continue

            profile, _ = MemberProfile.objects.get_or_create(
                user=user,
                defaults={
                    'title': title,
                    'district': dist_objects[dist_idx] if dist_idx < len(dist_objects) else None,
                    'years_experience': years,
                    'bio': f'{first} {last} is a {title.lower()} with {years} years of experience in literacy education.',
                    'is_public': True,
                }
            )
            profile.problem_statements.set([ps_objects[i] for i in ps_idxs if i < len(ps_objects)])

        self.stdout.write(self.style.SUCCESS('Seed complete!'))

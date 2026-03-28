"""
Import school district data from NCES (National Center for Education Statistics).

This command can import from a CSV file with the following columns:
  NCES_ID, Name, State, Locale, Enrollment, FRL_Pct, ESL_Pct

Locale codes (NCES):
  11,12,13 = Urban (City)
  21,22,23 = Suburban
  31,32,33 = Town
  41,42,43 = Rural

Usage:
  python manage.py import_nces --file districts.csv
  python manage.py import_nces --demo   (generates additional demo districts)
"""
import csv
from django.core.management.base import BaseCommand
from community.models import District

LOCALE_MAP = {
    '11': 'urban', '12': 'urban', '13': 'urban',
    '21': 'suburban', '22': 'suburban', '23': 'suburban',
    '31': 'town', '32': 'town', '33': 'town',
    '41': 'rural', '42': 'rural', '43': 'rural',
}

DEMO_DISTRICTS = [
    ('Clark County School District', 'NV', 'urban', 320000, 62.1, 17.8),
    ('Hillsborough County Public Schools', 'FL', 'suburban', 217000, 57.3, 9.2),
    ('San Antonio ISD', 'TX', 'urban', 47000, 89.1, 24.6),
    ('Minneapolis Public Schools', 'MN', 'urban', 33000, 62.0, 26.3),
    ('Rochester City School District', 'NY', 'urban', 26000, 87.4, 14.1),
    ('Jefferson County Public Schools', 'KY', 'suburban', 96000, 62.8, 10.5),
    ('Tucson Unified School District', 'AZ', 'urban', 42000, 68.7, 16.9),
    ('Fresno Unified School District', 'CA', 'urban', 71000, 85.2, 22.4),
    ('Norfolk Public Schools', 'VA', 'urban', 28000, 73.6, 5.8),
    ('Columbus City Schools', 'OH', 'urban', 49000, 74.2, 12.7),
    ('Knox County Schools', 'TN', 'suburban', 59000, 42.3, 6.1),
    ('Greenville County Schools', 'SC', 'suburban', 77000, 51.8, 11.4),
    ('Fayette County Public Schools', 'KY', 'suburban', 41000, 43.7, 8.3),
    ('Sioux Falls School District', 'SD', 'town', 25000, 46.2, 14.8),
    ('Amarillo ISD', 'TX', 'town', 30000, 67.5, 18.3),
    ('Anchorage School District', 'AK', 'suburban', 43000, 48.9, 16.7),
    ('Clarksville-Montgomery County SS', 'TN', 'suburban', 37000, 38.4, 4.2),
    ('Bibb County School District', 'GA', 'town', 21000, 82.1, 3.7),
    ('Pine Bluff School District', 'AR', 'rural', 3500, 91.2, 1.4),
    ('Whitfield County Schools', 'GA', 'town', 8500, 73.4, 28.9),
]


def get_size_category(enrollment):
    if enrollment < 1000:
        return 'small'
    elif enrollment < 5000:
        return 'medium'
    elif enrollment < 25000:
        return 'large'
    return 'very_large'


class Command(BaseCommand):
    help = 'Import school district data from NCES CSV or generate demo data'

    def add_arguments(self, parser):
        parser.add_argument('--file', type=str, help='Path to NCES CSV file')
        parser.add_argument('--demo', action='store_true', help='Import additional demo districts')

    def handle(self, *args, **options):
        if options.get('file'):
            self._import_csv(options['file'])
        elif options.get('demo'):
            self._import_demo()
        else:
            self.stdout.write('Usage: --file <csv> or --demo')

    def _import_csv(self, filepath):
        count = 0
        with open(filepath, 'r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                nces_id = row.get('NCES_ID', '').strip()
                enrollment = int(row.get('Enrollment', 0))
                locale_code = row.get('Locale', '').strip()
                district_type = LOCALE_MAP.get(locale_code, 'town')

                District.objects.update_or_create(
                    nces_id=nces_id,
                    defaults={
                        'name': row.get('Name', '').strip(),
                        'state': row.get('State', '').strip()[:2].upper(),
                        'district_type': district_type,
                        'size_category': get_size_category(enrollment),
                        'enrollment': enrollment,
                        'free_reduced_lunch_pct': float(row.get('FRL_Pct', 0)),
                        'esl_pct': float(row.get('ESL_Pct', 0)),
                    }
                )
                count += 1
        self.stdout.write(self.style.SUCCESS(f'Imported {count} districts from CSV'))

    def _import_demo(self):
        count = 0
        for i, (name, state, dtype, enroll, frl, esl) in enumerate(DEMO_DISTRICTS, start=100):
            _, created = District.objects.get_or_create(
                name=name, state=state,
                defaults={
                    'nces_id': f'NCES-{i:04d}',
                    'district_type': dtype,
                    'size_category': get_size_category(enroll),
                    'enrollment': enroll,
                    'free_reduced_lunch_pct': frl,
                    'esl_pct': esl,
                }
            )
            if created:
                count += 1
        self.stdout.write(self.style.SUCCESS(f'Added {count} demo districts'))

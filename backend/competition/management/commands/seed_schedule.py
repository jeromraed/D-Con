"""
Management command to seed schedule data from D-CON Hub Schedule CSV.
Usage: python manage.py seed_schedule
"""
from django.core.management.base import BaseCommand
from competition.models import ScheduleEvent, SubEvent
from datetime import datetime
from zoneinfo import ZoneInfo


# Schedule data parsed from the CSV
SCHEDULE_DATA = [
    # === DAY 1 ===
    {
        "day": 1, "title": "Welcome Activity",
        "start": "12:00", "end": "12:50",
        "location": "", "sub_events": []
    },
    {
        "day": 1, "title": "كلمة افتتاحية",
        "start": "13:00", "end": "13:20",
        "location": "", "sub_events": []
    },
    {
        "day": 1, "title": "Talks",
        "start": "13:30", "end": "14:00",
        "location": "", "sub_events": [
            {"title": "Reading Marathon", "location": "Uri"},
            {"title": "Programming", "location": "Sporting"},
            {"title": "Arts", "location": "Smouha"},
            {"title": "Space Management", "location": "Uri"},
            {"title": "UCMAS", "location": "KDC"},
        ]
    },
    {
        "day": 1, "title": "Workshops",
        "start": "14:10", "end": "15:40",
        "location": "KDC", "sub_events": [
            {"title": "Lab", "location": "KDC"},
        ]
    },
    {
        "day": 1, "title": "الغذاء",
        "start": "15:50", "end": "16:50",
        "location": "", "sub_events": []
    },
    {
        "day": 1, "title": "صلاة الغروب",
        "start": "17:00", "end": "17:20",
        "location": "", "sub_events": []
    },
    {
        "day": 1, "title": "Games",
        "start": "17:30", "end": "18:20",
        "location": "", "sub_events": []
    },
    {
        "day": 1, "title": "Keynote Speaker",
        "start": "18:30", "end": "19:10",
        "location": "", "sub_events": []
    },
    {
        "day": 1, "title": "Pika Kuka",
        "start": "19:10", "end": "19:30",
        "location": "", "sub_events": []
    },
    {
        "day": 1, "title": "Talks",
        "start": "19:40", "end": "20:10",
        "location": "", "sub_events": [
            {"title": "Science Carnival", "location": "KDC"},
            {"title": "Internal, National & International Competitions", "location": "KDC"},
            {"title": "وسائل الايضاح", "location": "Uri"},
            {"title": "Summer School", "location": "God's Masterpiece"},
            {"title": "Career Consultation", "location": "Eime"},
        ]
    },
    {
        "day": 1, "title": "Talks",
        "start": "20:20", "end": "20:50",
        "location": "", "sub_events": [
            {"title": "Astronomy Camp", "location": "KDC"},
            {"title": "Technology", "location": "Eime"},
            {"title": "Small Business", "location": "Pharo"},
            {"title": "Interviews (servants selection)", "location": "KDC"},
            {"title": "Photography", "location": "Bokalia"},
        ]
    },
    {
        "day": 1, "title": "Poster Sessions",
        "start": "21:00", "end": "23:00",
        "location": "", "sub_events": []
    },
    {
        "day": 1, "title": "العشاء",
        "start": "23:10", "end": "00:00",
        "location": "", "sub_events": []
    },
    {
        "day": 1, "title": "Mini Astronomy Camp",
        "start": "00:10", "end": "02:00",
        "location": "", "sub_events": []
    },

    # === DAY 2 ===
    {
        "day": 2, "title": "قداس",
        "start": "08:00", "end": "10:00",
        "location": "", "sub_events": []
    },
    {
        "day": 2, "title": "الفطار",
        "start": "10:00", "end": "10:50",
        "location": "", "sub_events": []
    },
    {
        "day": 2, "title": "Workshops",
        "start": "11:00", "end": "12:30",
        "location": "KDC", "sub_events": [
            {"title": "Differential Gears", "location": "KDC"},
        ]
    },
    {
        "day": 2, "title": "Games",
        "start": "12:40", "end": "13:30",
        "location": "", "sub_events": []
    },
    {
        "day": 2, "title": "Workshops",
        "start": "13:40", "end": "15:10",
        "location": "KDC", "sub_events": [
            {"title": "Microscope", "location": "KDC"},
        ]
    },
    {
        "day": 2, "title": "الغذاء",
        "start": "15:20", "end": "16:10",
        "location": "", "sub_events": []
    },
    {
        "day": 2, "title": "صلاة الغروب",
        "start": "16:10", "end": "16:30",
        "location": "", "sub_events": []
    },
    {
        "day": 2, "title": "Workshops",
        "start": "16:40", "end": "18:00",
        "location": "KDC", "sub_events": [
            {"title": "Sensors & Actuators", "location": "KDC"},
        ]
    },
    {
        "day": 2, "title": "Closure",
        "start": "18:10", "end": "19:00",
        "location": "", "sub_events": []
    },
]


class Command(BaseCommand):
    help = 'Seed schedule events from the D-CON Hub Schedule CSV data'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear', action='store_true',
            help='Clear existing schedule events before seeding',
        )

    def handle(self, *args, **options):
        if options['clear']:
            count = ScheduleEvent.objects.count()
            ScheduleEvent.objects.all().delete()
            self.stdout.write(self.style.WARNING(f'Deleted {count} existing events'))

        tz = ZoneInfo('Africa/Cairo')
        # Day 1 = 2026-02-10, Day 2 = 2026-02-11
        base_dates = {1: datetime(2026, 2, 10), 2: datetime(2026, 2, 11)}

        created_count = 0
        for item in SCHEDULE_DATA:
            base = base_dates[item["day"]]
            
            start_h, start_m = map(int, item["start"].split(":"))
            end_h, end_m = map(int, item["end"].split(":"))
            
            # Handle overnight events (e.g. 23:10 - 00:00 or 00:10 - 02:00)
            start_date = base
            end_date = base
            if item["day"] == 1 and start_h < 8:
                # Early morning hours belong to the next calendar day
                start_date = datetime(2026, 2, 11)
                end_date = datetime(2026, 2, 11)
            elif end_h < start_h:
                end_date = datetime(2026, 2, 11) if item["day"] == 1 else datetime(2026, 2, 12)
            
            start_dt = start_date.replace(hour=start_h, minute=start_m, tzinfo=tz)
            end_dt = end_date.replace(hour=end_h, minute=end_m, tzinfo=tz)

            event = ScheduleEvent.objects.create(
                title=item["title"],
                start_time=start_dt,
                end_time=end_dt,
                location=item.get("location", ""),
                day=item["day"],
                is_done=False,
            )

            for sub in item.get("sub_events", []):
                SubEvent.objects.create(
                    schedule_event=event,
                    title=sub["title"],
                    location=sub.get("location", ""),
                )

            created_count += 1

        self.stdout.write(self.style.SUCCESS(
            f'Successfully created {created_count} schedule events'
        ))

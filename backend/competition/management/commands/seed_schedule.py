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
    # === Pre Conference Events (أنشطة ما قبل المؤتمر) ===
    {
        "day": 1, "title": "Welcome Attendees",
        "start": "10:00", "end": "10:50",
        "location": "", "sub_events": []
    },
    {
        "day": 1, "title": "Workshops I",
        "start": "11:00", "end": "12:30",
        "location": "", "sub_events": [
            {"title": "طباعة على الحجر - Safina", "location": "H"},
            {"title": "صلصال - Safina", "location": "H"},
            {"title": "MechaScope - KDC", "location": "C1"},
            {"title": "Microscope - KDC", "location": "C2"},
            {"title": "Marionette - Uri", "location": "C3"},
        ]
    },

    # === Conference (المؤتمر) ===
    {
        "day": 1, "title": "Welcome Attendees (Part II)",
        "start": "12:40", "end": "13:00",
        "location": "", "sub_events": []
    },
    {
        "day": 1, "title": "Main Welcome Message",
        "start": "13:10", "end": "13:30",
        "location": "", "sub_events": []
    },
    {
        "day": 1, "title": "Talks A",
        "start": "13:40", "end": "14:10",
        "location": "", "sub_events": [
            {"title": "تطوير التربية الكنسية - Safina", "location": "H"},
            {"title": "Space Management - Uri", "location": "C1"},
            {"title": "Robotics Competitions - KDC", "location": "C2"},
            {"title": "Astronomy Camp - KDC", "location": "C3"},
            {"title": "UCMAS - KDC", "location": "C4"},
        ]
    },
    {
        "day": 1, "title": "Workshops II",
        "start": "14:20", "end": "15:50",
        "location": "", "sub_events": [
            {"title": "خرز - Safina", "location": "H"},
            {"title": "طباعة على الخشب - Safina", "location": "H"},
            {"title": "Sensors & Actuators - KDC", "location": "C1"},
            {"title": "Lab - KDC", "location": "C2"},
            {"title": "Leather - Uri", "location": "C3"},
        ]
    },
    {
        "day": 1, "title": "Lunch",
        "start": "16:00", "end": "16:40",
        "location": "", "sub_events": []
    },
    {
        "day": 1, "title": "Prayer",
        "start": "16:50", "end": "17:10",
        "location": "", "sub_events": []
    },
    {
        "day": 1, "title": "Pika Kuka",
        "start": "17:10", "end": "17:40",
        "location": "", "sub_events": []
    },
    {
        "day": 1, "title": "Keynote Speaker",
        "start": "17:40", "end": "18:00",
        "location": "", "sub_events": []
    },
    {
        "day": 1, "title": "Talks B",
        "start": "18:10", "end": "18:40",
        "location": "", "sub_events": [
            {"title": "Science Carnival - KDC", "location": "H"},
            {"title": "التعليم المستمر - Eime", "location": "C1"},
            {"title": "المعارض الفنية للشباب - Safina", "location": "C2"},
            {"title": "وسائل الايضاح - Uri", "location": "C3"},
            {"title": "Summer School - God's Masterpiece", "location": "C4"},
        ]
    },
    {
        "day": 1, "title": "Talks C",
        "start": "18:50", "end": "19:20",
        "location": "", "sub_events": [
            {"title": "Servants Selection - KDC", "location": "H"},
            {"title": "Volunteering - Eime", "location": "C1"},
            {"title": "STEAM Camps - Pokalia", "location": "C2"},
            {"title": "Reading Marathon - Uri", "location": "C3"},
            {"title": "Small Business - Faro", "location": "C4"},
        ]
    },
    {
        "day": 1, "title": "Poster Sessions + Dinner",
        "start": "19:30", "end": "21:00",
        "location": "", "sub_events": []
    },
    {
        "day": 1, "title": "Closure",
        "start": "21:10", "end": "21:30",
        "location": "", "sub_events": []
    },
    {
        "day": 1, "title": "Astronomy Camp",
        "start": "21:30", "end": "23:00",
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
        base_dates = {1: datetime(2026, 2, 20), 2: datetime(2026, 2, 21)}

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

import os
import shutil

from django.contrib.sessions.models import Session
from django.contrib.staticfiles import finders
from django.core.management.base import BaseCommand

FILES_TO_REMOVE = (
    os.path.join(finders.find('style'), 'drecp.png'),
    os.path.join(finders.find('style'), 'drecp_basemap.png'),
)


class Command(BaseCommand):

    def handle(self, *args, **options):
        Session.objects.all().delete()

        for f in FILES_TO_REMOVE:
            try:
                os.remove(f)
            except OSError:
                print('Could not remove {}'.format(f))

        for d in os.listdir('tmp'):
            try:
                shutil.rmtree(os.path.join('tmp', d))
            except OSError:
                print('Could not remove {}'.format(d))

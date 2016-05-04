from django.conf.urls import patterns, url

from CA_Energy_Scenario_App import views

urlpatterns = patterns('',
    url(r'^$', views.index, name='index'),
    url(r'^report/$', views.ReportView.as_view(), name='report')
)

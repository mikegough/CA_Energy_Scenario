from django.conf.urls import patterns, include, url

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'drecp_eemaps.views.home', name='home'),
    # url(r'^drecp_eemaps/', include('drecp_eemaps.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    # url(r'^admin/', include(admin.site.urls)),
    url(r'^CA_Energy_Scenario_App/', include ('CA_Energy_Scenario.urls')),
    url(r'^$', include ('CA_Energy_Scenario_App.urls'))
)

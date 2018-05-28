
ACLOCAL_AMFLAGS = -I $(top_srcdir)/m4

AM_CPPFLAGS += -I$(top_srcdir)/src -I$(top_srcdir)/src/shared -I$(top_srcdir)/src/dnsdump

AM_LDFLAGS = -lpcap

AM_CFLAGS = -Wall -w -I/usr/include/

bin_PROGRAMS = pcapmerge

pcapmerge_SOURCES = \
	main.c


ACLOCAL_AMFLAGS = -I $(top_srcdir)/m4

AM_CPPFLAGS += -I$(top_srcdir)/src -I$(top_srcdir)/src/shared -I$(top_srcdir)/src/analyzer

bin_PROGRAMS = dnsanalyzer

dnsanalyzer_SOURCES =                  \
	CaptureSession.cpp             \
	CaptureSession.h               \
	default_settings.h             \
	Detector.h                     \
	Engine.h                       \
	GnuPlot.h                      \
	hash/RNG.h                     \
	hash/UniversalHashSystem.h     \
	hash/UniversalVectorHash.h     \
	IPOffsetTable.c                \
	IStorage.h                     \
	log/Log.cpp                    \
	log/Log.h                      \
	main.cpp                       \
	policies/dns/nameser.h         \
	policies/dns/PacketParser.cpp  \
	policies/dns/PacketParser.h    \
	policies/ip/IPAddress.cpp      \
	policies/ip/IPAddress.h        \
	policies/ip/iphash.cpp         \
	policies/ip/iphash.h           \
	policies/ip/IPPolicy.cpp       \
	policies/ip/IPv4Address.h      \
	policies/ip/IPv6Address.h      \
	policies/IPPolicy.h            \
	policies/QueryNamePolicy.cpp   \
	policies/QueryNamePolicy.h     \
	proc/Runnable.h                \
	proc/Thread.h                  \
	proc/ThreadPool.cpp            \
	proc/ThreadPool.h              \
	Settings.cpp                   \
	Settings.h                     \
	Sketch.h                       \
	statistics/GammaParameters.cpp \
	statistics/GammaParameters.h   \
	statistics/statistics.cpp      \
	statistics/statistics.h        \
	Storage.h                      \
	struct/RandomVectors.h         \
	struct/SafeGrowTable.h         \
	struct/SafeQueue.h             \
	struct/SparseFlow.h            \
	struct/SparseFlow.cpp          \
	struct/TimeSeries.cpp          \
	struct/TimeSeries.h            \
	sync/Mutex.h                   \
	sync/MutexLocker.h             \
	sync/ReadLocker.h              \
	sync/ReadWriteLock.h           \
	sync/Semaphore.h               \
	sync/Signaler.h                \
	sync/WaitCondition.h           \
	sync/WriteLocker.h             \
	util/NSetsMerge.h

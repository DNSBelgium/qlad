#                                               -*- Autoconf -*-
# Process this file with autoconf to produce a configure script.

AC_PREREQ([2.65])
AC_INIT([FULL-PACKAGE-NAME], [VERSION], [BUG-REPORT-ADDRESS])
AC_CONFIG_SRCDIR([src/analyzer/main.cpp])
AC_CONFIG_HEADERS([src/config.h])
AC_CONFIG_MACRO_DIR([m4])
AM_INIT_AUTOMAKE([foreign -Wall])

# Config header file prefix
AH_TOP([#ifndef _CONFIG_H_])
AH_TOP([#define _CONFIG_H_])
# Config header file suffix
AH_BOTTOM([#endif /* _CONFIG_H_ */])

# Default flags
CFLAGS="-Wall -Wextra -pedantic -std=gnu99 -Wno-variadic-macros -fno-common"
CXXFLAGS="-Wall -Wextra -pedantic -Wno-variadic-macros -fno-exceptions -fno-rtti -fno-common"
LDFLAGS="-Wl,--as-needed -Wl,--warn-common"


# LIBPCAP location
AC_ARG_WITH(libpcap,
        [  --with-libpcap=DIR      LIBPCAP install directory], [

            CXXFLAGS="$CXXFLAGS -I$withval/include"
            LDFLAGS="$LDFLAGS -L$withval/lib -Wl,-rpath,$withval/lib"
        ])

# Debugging
AC_MSG_CHECKING([whether to enable debugging])
AC_ARG_ENABLE([debug],
  AS_HELP_STRING([--enable-debug], [Enable debugging.]))
AS_IF([test "x$enable_debug" = "xyes"], [
  AC_MSG_RESULT([yes])
  dnl C preprocessor
  AC_DEFINE(DEBUG, 1, [Define to 1 if debugging functionality desired.])
  CFLAGS+=" -g -O0"
  CXXFLAGS+=" -g -O0"
], [
  AC_MSG_RESULT([no])
  dnl C preprocessor
  AC_DEFINE(NDEBUG, 1, [Define to 1 if no debugging functionality desired.])
  CFLAGS+=" -O3"
  CXXFLAGS+=" -O3"
])
AC_SUBST(CFLAGS)
AC_SUBST(CXXFLAGS)
AC_SUBST(LDFLAGS)


# Generate gnuplot files - intermediate data
AC_MSG_CHECKING([whether to enable generating of gnuplot files showing intermediate data])
AC_ARG_ENABLE([gnuplot-intermed],
  AS_HELP_STRING([--disable-gnuplot-intermed], [Disable generating of gnuplot files showing intermediate data.]))
AS_IF([test "x$enable_gnuplot_intermed" != "xno"],[
  AC_MSG_RESULT([yes])
  dnl C preprocessor
  AC_DEFINE(GNUPLOT_INTERMED, 1, [Define to 1 if generating of gnuplot files showing intermediate data desired.])
],[
  AC_MSG_RESULT([no])
])

# IPv6 functionality
AC_MSG_CHECKING([whether to enable IPv6 functionality])
AC_ARG_ENABLE([ipv6],
  AS_HELP_STRING([--disable-ipv6], [Disable IPv6 functionality.]))
AS_IF([test "x$enable_ipv6" != "xno"],[
  AC_MSG_RESULT([yes])
],[
  AC_MSG_RESULT([no])
  dnl C preprocessor
  AC_DEFINE(NO_IPV6, 1, [Define to 1 if no IPv6 functionality desired.])
])


# Documentation
DX_DOXYGEN_FEATURE(ON)
DX_HTML_FEATURE(ON)
DX_PDF_FEATURE(OFF)
DX_PS_FEATURE(OFF)
DX_INIT_DOXYGEN([$PACKAGE_NAME], [Doxygen.cfg], [doc])


# DNSdump conditional build
AC_MSG_CHECKING([whether to enable DNS dumping])
AC_ARG_ENABLE([dnsdump],
  AS_HELP_STRING([--enable-dnsdump], [Enable DNS dumping.]))
AS_IF([test "x$enable_dnsdump" = "xyes"], [
  AC_MSG_RESULT([yes])
] , [
  AC_MSG_RESULT([no])
])
dnl condiftional compilation
AM_CONDITIONAL(DNSDUMP, [test "x$enable_dnsdump" = "xyes"])


#AC_CONFIG_LINKS

# Checks for programs.
AC_PROG_CC
AC_PROG_CXX
AC_PROG_INSTALL

# Set make command.
AC_PROG_MAKE_SET

# Checks for libraries.
AC_CHECK_LIB([pcap], [pcap_compile], ,
  [AC_MSG_ERROR([could not find libpcap])])
AC_CHECK_LIB([pthread], [pthread_create], ,
  [AC_MSG_ERROR([could not find libpthread])])

# Check for libpcap PCAP_NETMASK_UNKNOWN
AC_MSG_CHECKING([whether libpcap knows PCAP_NETMASK_UNKNOWN])
cat>conftest.c<<EOF
#include <pcap.h>
int i = PCAP_NETMASK_UNKNOWN;
EOF
AS_IF([$CC -c conftest.c -o conftest.o > /dev/null 2>&1], [
  AC_MSG_RESULT([yes])
], [
  AC_MSG_RESULT([no])
  dnl C preprocessor
  AC_DEFINE(PCAP_NETMASK_UNKNOWN, 0, [Possibly using libpcap prior to 1.1.0.])
])
rm -f conftest.c conftest.o

#LT_INIT()

# Checks for header files.
AC_CHECK_HEADERS([arpa/inet.h \
                  limits.h    \
                  stdint.h    \
                  string.h    \
                  sys/time.h  \
                  syslog.h    \
                  unistd.h])

# Checks for typedefs, structures, and compiler characteristics.
AC_HEADER_STDBOOL
AC_C_INLINE
AC_TYPE_SIZE_T
AC_TYPE_UINT16_T
AC_TYPE_UINT32_T
AC_TYPE_UINT64_T
AC_TYPE_UINT8_T

# Checks for library functions.
AC_CHECK_FUNCS([gettimeofday \
                memset       \
                sqrt         \
                strtoul])

# Default preprocessor flags.
AC_SUBST([AM_CPPFLAGS], [""])

AC_CONFIG_FILES([Makefile              \
                 src/Makefile          \
                 src/analyzer/Makefile \
                 src/dnsdump/Makefile  \
                 src/pcap-merge/Makefile  \
                 test/Makefile         \
                 test/analyzer/Makefile])
AC_OUTPUT

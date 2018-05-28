/*
 * pcap-merge --- stupid simple pcap file merger
 *
 * Copyright (C) 2014  Nicolas Bareil <nico@chdir.org>
 *
 * This program is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 */

// NOTICE: this is a modified version of the original pcap-merge.c of https://github.com/nbareil/pcap-merge
// modified 2018-08-02 by Pieter Robberechts in context of implementing QLAD system at DNS Belgium
// to support continuous anomaly detection fr om S3 bucket

#include <stdio.h>
#include <stdlib.h>
#include <errno.h>

#include <pcap/pcap.h>

unsigned int n;
pcap_dumper_t *writer;

void process_pcapfile(char *out, char *filename) {
    char errbuf[PCAP_ERRBUF_SIZE];
    unsigned char buf[16];
    char cmd[256];
    FILE *fd;
    int ret;
    pcap_t *p;

    /*
     * Open the file, determine if its zipped, and then
     * reopen with the proper method.
     */
    fd = fopen(filename, "r");
    if (fd == NULL) {
      fprintf(stderr, "error reading file %s: %s\n", filename, strerror(errno));
      exit(1);
    }
    ret = fread(buf, 1, 16, fd);
    if (ret != 16) {
      if (ferror(fd)) {
        fprintf(stderr, "error reading dump file: %s", strerror(errno));
      } else {
        fprintf(stderr, "truncated input file; tried to read %u bytes, only got %u", 16, ret);
      }
      exit(1);
    }
    if (((buf[0] == 0x1F) && ((buf[1] == 0x8B) ||
          (buf[1] == 0x9D))) ||
          ((buf[0] == 'B') && (buf[1] == 'Z') && (buf[2] == 'h'))) {
      bzero(cmd, 256);
      fclose(fd);

      if (buf[0] == 'B') {
        strncpy(cmd, "bzip2 -dc ", 11);
      } else {
        if (buf[1] == 0x8B)
          strncpy(cmd, "gzip -dc ", 10);
        else
          strncpy(cmd, "zcat ", 6);
      }

      strncat(cmd, filename, (256 - strlen(cmd)));

      fd = popen(cmd, "r");
      if (fd == NULL) {
        fprintf(stderr, "%s: %s", filename, strerror(errno));
        exit(1);
      }
    } else {
      /* Cheap mans fseek */
      fclose(fd);
      fd = fopen(filename, "r");
      if (fd == NULL) {
        fprintf(stderr, "%s: %s", filename, strerror(errno));
        exit(1);
      }
    }

    p = pcap_fopen_offline(fd, errbuf);
    if (! p) {
        fprintf(stderr, "pcap_open_offline(%s) failed: %s", filename, errbuf);
        return;
    }

    if (n++ == 0) {
        writer = pcap_dump_open(p, out);
        if (! writer) {
            fprintf(stderr, "pcap_dump_open(%s) failed: %s", filename, pcap_geterr(p));
            exit(1);
        }
    }

    while (1) {
        struct pcap_pkthdr *h;
        unsigned char *data;
        int ret;

        ret = pcap_next_ex(p, &h, (const unsigned char **)&data);

        switch (ret) {
            case 1:
                // ok
                pcap_dump((unsigned char *)writer, h, data);
                break;
            case 0:
                // timeout expired
                fprintf(stderr, "timeout");
                break;
            case -1:
                // error while reading packet
                fprintf(stderr, "error while reading packet");
                break;
            case -2:
                // no more packet
                // fprintf(stderr, "no more packet");
                goto close_pcap;
            default:
                // unkown error
                fprintf(stderr, "unkown error %d", ret);
                break;
        }

    }

close_pcap:
    pcap_close(p);
}

int main(int argc, char *argv[]) {
    unsigned int i;

    if (argc < 3) {
        fprintf(stderr, "usage: %s outfile infile1 infile2 infile3 ...\n", argv[0]);
        return 1;
    }

    for (i = 2; i < argc; i++) {
        fprintf(stderr, "reading %s... ", argv[i]);
        process_pcapfile(argv[1], argv[i]);
        fprintf(stderr, "done.\n");
    }

    pcap_dump_close(writer);
    fprintf(stderr, "kthx bye!\n");

    return 0;
}

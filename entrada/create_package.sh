#!/usr/bin/env bash

# NOTICE: this is a modified version of https://github.com/SIDN/entrada
# modified 2017-08-01 by Pieter Robberechts in context of implementing QLAD system at DNS Belgium

VERSION=$(cat VERSION)
VERSION_PCAP_TO_PARQUET=0.0.9
BASE_DIR="entrada-$VERSION"
echo "Create ENTRADA installation package for version $VERSION"

mkdir $BASE_DIR
cp pcap-to-parquet/target/pcap-to-parquet-${VERSION_PCAP_TO_PARQUET}-jar-with-dependencies.jar $BASE_DIR
cp -R scripts $BASE_DIR
cp -R grafana-dashboard $BASE_DIR
cp VERSION $BASE_DIR
cp UPGRADE $BASE_DIR
cd $BASE_DIR
mv pcap-to-parquet-${VERSION_PCAP_TO_PARQUET}-jar-with-dependencies.jar entrada-latest.jar
cd ..

tar -zcvf "$BASE_DIR.tar.gz" $BASE_DIR
rm -rf $BASE_DIR

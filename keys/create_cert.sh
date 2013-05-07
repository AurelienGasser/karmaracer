#!/bin/sh
openssl req -new -x509 -nodes -days 365 -newkey rsa:1024 -keyout $1.key -out $1.crt -config openssl.cnf
#openssl req -x509 -nodes -days 365 -subj '/C=FR/ST=Paris/L=XII/CN=karma.origamix.fr/O=Origamix/OU=Studios' -newkey rsa:1024 -keyout karma.key -out karma.crt
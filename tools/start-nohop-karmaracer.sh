#!/bin/sh
git pull origin master
killall node
cd ../server
# nohup node server.js > server.nohup.out 2> server.log.err < /dev/null &
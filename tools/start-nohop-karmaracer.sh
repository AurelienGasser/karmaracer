#!/bin/sh
git pull origin master
killall node
cd ../server
nohup node server.js &
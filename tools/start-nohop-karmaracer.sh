#!/bin/sh
git pull origin master
killall node
nohup node ../server/server.js &
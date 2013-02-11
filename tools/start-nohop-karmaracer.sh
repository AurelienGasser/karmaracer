#!/bin/sh
killall node
cd ./server && nohup node server.js
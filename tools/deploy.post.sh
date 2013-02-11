#!/bin/sh
npm install;
forever start -append -l karmaracer.log -o out.log -e err.log server/server.js
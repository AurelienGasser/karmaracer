#!/bin/sh
npm install;
ls;
forever start -append -l karmaracer.log -o out.log -e err.log server.js
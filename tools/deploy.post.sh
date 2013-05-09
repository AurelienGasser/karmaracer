#!/bin/sh
npm install;
rm out.log;rm err.log;
grunt;
forever start -append -l karmaracer.log -o out.log -e err.log server.js
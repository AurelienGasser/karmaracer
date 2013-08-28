#!/bin/sh
npm install;
rm out.log;rm err.log;
grunt;
NODE_ENV=preprod forever start -append -l karmaracer-preprod.log -o out.log -e err.log server-preprod.js
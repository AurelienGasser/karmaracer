#!/bin/sh
npm install;
forever start -append -l forever.log -o out.log -e err.log server/server.js
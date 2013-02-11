#!/bin/sh
cd ..;
npm install;
forever start -append -l forever.log -o log/out.log -e log/err.log server/server.js
#!/bin/bash
echo "Starting debug server run..." > debug.log
npm run dev -- -p 49235 >> debug.log 2>&1 &
echo $! > debug.pid
echo "Server started with PID $(cat debug.pid)" >> debug.log
sleep 5
echo "Log contents after 5 seconds:" >> debug.log
cat debug.log

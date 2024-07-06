#!/bin/sh

on_stop() {
    kill -KILL $cpid
}

trap on_stop TSTP

busybox httpd -v -f -p 3216 -h /public &
cpid=$!

wait $cpid
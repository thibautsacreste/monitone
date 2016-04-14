#!/usr/bin/env bash
websocketd --port=9090 --devconsole --passenv PATH,ZOOKEEPER ./tail-logs.sh

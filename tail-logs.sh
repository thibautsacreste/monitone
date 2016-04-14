#!/usr/bin/env bash
kf syslogger | jq --unbuffered --compact-output '.content|fromjson'

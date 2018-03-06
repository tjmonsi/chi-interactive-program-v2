#!/bin/bash

trap killgroup SIGINT ERR EXIT

killgroup () {
  echo
  echo killing...
  kill 0
}

node compiler --dev --watch &
./node_modules/.bin/superstatic public -c superstatic.json &
./node_modules/.bin/webpack --mode=development --watch



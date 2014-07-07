#!/bin/bash -e

scss-lint .
grunt dist test test-mocha

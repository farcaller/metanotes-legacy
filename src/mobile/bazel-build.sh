#!/usr/bin/env bash

# cd src/mobile/android

# TEMP_DIR="$(mktemp -d -t ci-XXXXXXXXXX)"

# export GRADLE_USER_HOME="$TEMP_DIR/.gradle"

# function cleaanup {
#   rm -rf "$TEMP_DIR"
# }

# trap cleanup EXIT

# echo "* running with temp dir at $TEMP_DIR"

# exec ./gradlew --no-daemon assembleRelease

#exec $1 bundle --entry-file ./src/mobile/index.js --platform android --dev true --bundle-output $2

echo "RN===="
cd src/mobile
cp ../../package.json .
exec $1 --help
echo "====NR"

#!/usr/bin/env bash

set -ex

curl -LO https://github.com/improbable-eng/grpc-web/releases/download/v0.14.0/grpcwebproxy-v0.14.0-linux-x86_64.zip
unzip grpcwebproxy-v0.14.0-linux-x86_64.zip
mv dist/grpcwebproxy-v0.14.0-linux-x86_64 $1
rmdir dist
rm grpcwebproxy-v0.14.0-linux-x86_64.zip

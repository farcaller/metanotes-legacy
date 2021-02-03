#!/bin/bash
echo "STABLE_GIT_COMMIT $(git rev-parse --short=8 HEAD)"
echo "STABLE_NODE_ENV ${BUILD_NODE_ENV:-development}"

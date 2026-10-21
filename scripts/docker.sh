#!/usr/bin/env bash
# Runs a command inside the pinned test image (tests/docker/Dockerfile) with the repo mounted.
# Screenshots are only comparable inside this image (fonts, software WebGL), so CI and local
# baseline updates both go through it.
#
#   scripts/docker.sh pnpm test:e2e --update-snapshots
#   DOCKER_NETWORK=none scripts/docker.sh pnpm test:e2e   # proves the replay needs no network
set -euo pipefail
cd "$(dirname "$0")/.."

IMAGE=d2r-playwright-tests
docker build -q -t "$IMAGE" tests/docker >/dev/null

tty_flag=()
[ -t 1 ] && tty_flag=(-t)

exec docker run --rm "${tty_flag[@]}" --init --ipc=host \
	--network "${DOCKER_NETWORK:-bridge}" \
	-u "$(id -u):$(id -g)" -e HOME=/tmp \
	-e PW_DOCKER=1 -e CI -e RECORD \
	-v "$PWD":/work -w /work \
	"$IMAGE" "$@"

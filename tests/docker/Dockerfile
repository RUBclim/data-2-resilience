# Pinned environment for e2e + screenshot tests (local and CI).
# Screenshots depend on fonts and the software WebGL rasterizer, so baselines are only valid
# when created and compared inside this image. Bump PLAYWRIGHT together with @playwright/test.
ARG PLAYWRIGHT=v1.64.1-noble
FROM mcr.microsoft.com/playwright:${PLAYWRIGHT}@sha256:7852dc5a7d72f5fe458a597d690f6c42fbc8e9e26ddfa95f8e6ef552558d9bbf

# the image ships node 24; the project is on node 22 (package.json engines)
ARG NODE_VERSION=22.23.0
ARG NODE_SHA256=535eeb608ca1e0b71d49a0e36991d449d5f935fbb04eca61677519b010cd673a
ARG PNPM_VERSION=10.34.7
RUN curl -fsSLo /tmp/node.tar.gz "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.gz" \
	&& echo "${NODE_SHA256}  /tmp/node.tar.gz" | sha256sum -c - \
	&& mkdir -p /opt/node \
	&& tar -xzf /tmp/node.tar.gz -C /opt/node --strip-components=1 \
	&& rm /tmp/node.tar.gz \
	&& /opt/node/bin/npm install -g "pnpm@${PNPM_VERSION}"
ENV PATH=/opt/node/bin:$PATH \
	COREPACK_ENABLE_STRICT=0
RUN node --version && pnpm --version

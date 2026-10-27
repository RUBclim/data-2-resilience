# Pinned environment for e2e + screenshot tests (local and CI).
# Screenshots depend on fonts and the software WebGL rasterizer, so baselines are only valid
# when created and compared inside this image. Bump PLAYWRIGHT together with @playwright/test.
ARG PLAYWRIGHT=v1.64.1-noble
FROM mcr.microsoft.com/playwright:${PLAYWRIGHT}@sha256:7852dc5a7d72f5fe458a597d690f6c42fbc8e9e26ddfa95f8e6ef552558d9bbf

# the node 24 of the image lags behind the security releases: pin the one of .nvmrc
ARG NODE_VERSION=24.22.1
ARG NODE_SHA256=eb6728e77c576a35162c122c45ccadf224d89ff00abc8dae46cc2897c6002d7c
# keep in sync with `packageManager` in package.json
ARG PNPM_VERSION=12.15.0
RUN curl -fsSLo /tmp/node.tar.gz "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.gz" \
	&& echo "${NODE_SHA256}  /tmp/node.tar.gz" | sha256sum -c - \
	&& mkdir -p /opt/node \
	&& tar -xzf /tmp/node.tar.gz -C /opt/node --strip-components=1 \
	&& rm /tmp/node.tar.gz \
	&& /opt/node/bin/npm install -g "pnpm@${PNPM_VERSION}"
ENV PATH=/opt/node/bin:$PATH
RUN node --version && pnpm --version

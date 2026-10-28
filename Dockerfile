FROM node:24-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
# node 25+ no longer ships corepack: install the version of `packageManager` in package.json
RUN npm install -g pnpm@12.15.0
COPY . /app
WORKDIR /app

FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS build
ENV IS_DOCKER=true
# even though it's not in vercel, we need to override the production URL
ENV VERCEL_PROJECT_PRODUCTION_URL=dashboard.data2resilience.de
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build

FROM node:24-slim
RUN : \
    && apt-get update \
    && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
        wget \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/build app/build/
EXPOSE 3000
CMD [ "node", "app/build" ]

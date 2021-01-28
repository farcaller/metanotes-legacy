#### build the metanotes-server-api package in the debian container first, as it cannot be built within alpine

FROM node:15-slim as build_protoc

RUN set -ex; \
    apt-get update; \
    apt-get install -y curl python3 build-essential; \
    curl -LO https://github.com/grpc/grpc-web/releases/download/1.2.1/protoc-gen-grpc-web-1.2.1-linux-x86_64; \
    mv protoc-gen-grpc-web-1.2.1-linux-x86_64 /usr/bin/protoc-gen-grpc-web; \
    chmod 755 /usr/bin/protoc-gen-grpc-web

WORKDIR /usr/src/app
COPY .eslintrc.js package.json yarn.lock tsconfig.* ./ 
COPY packages/metanotes-server-api/package.json ./packages/metanotes-server-api/package.json 
COPY packages/metanotes-server-api-web/package.json ./packages/metanotes-server-api-web/package.json 

WORKDIR /usr/src/app/packages
COPY ./packages/metanotes-server-api ./metanotes-server-api
COPY ./packages/metanotes-server-api-web ./metanotes-server-api-web
RUN yarn install

WORKDIR /usr/src/app/packages/metanotes-server-api
RUN yarn build

WORKDIR /usr/src/app/packages/metanotes-server-api-web
RUN yarn build

####

FROM node:15-alpine3.12 as build_deps

RUN apk --update add python2 build-base

WORKDIR /usr/src/app
COPY . ./
RUN yarn

WORKDIR /usr/src/app/packages/metanotes-server-api
COPY --from=build_protoc /usr/src/app/packages/metanotes-server-api/lib ./lib
WORKDIR /usr/src/app/packages/metanotes-server-api-web
COPY --from=build_protoc /usr/src/app/packages/metanotes-server-api-web/lib ./lib

####

FROM build_deps as build_server

WORKDIR /usr/src/app/packages/metanotes-server
RUN yarn build

####

FROM build_deps as build_core

ARG BUILD_SHA=docker-dev

WORKDIR /usr/src/app/packages/metanotes-filter
RUN yarn test
RUN yarn build

WORKDIR /usr/src/app/packages/metanotes-store
RUN yarn test
RUN yarn build

WORKDIR /usr/src/app/packages/metanotes-core
RUN sed -i -e "s/export const BUILD_SHA.*/export const BUILD_SHA = '${BUILD_SHA}';/" ./src/buildinfo.ts
RUN env CI=true yarn test
RUN env CI=true yarn build

####

FROM nginx:1.12-alpine as deploy_core

COPY --from=build_core /usr/src/app/packages/metanotes-core/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

####

FROM node:15-alpine3.12 as deploy_server

COPY --from=build_server /usr/src/app/packages/metanotes-server/dist/ /usr/src/app/
COPY ./packages/metanotes-server/migrations /usr/src/migrations
WORKDIR /usr/src/app
CMD ["sh", "-c", "exec node ./main.js \"${DATA_DIR}/db.sqlite\" \"${LISTEN_ADDRESS}\""]

####

FROM envoyproxy/envoy-alpine:v1.16-latest as deploy_envoy

RUN apk --no-cache add ca-certificates

COPY /packages/metanotes-server/envoy-config-compose.yaml /envoy-config.yaml

CMD ["/usr/local/bin/envoy", "-c", "/envoy-config.yaml"]

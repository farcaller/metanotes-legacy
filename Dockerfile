FROM node:15-slim as build_protoc

RUN set -ex; \
    apt-get update; \
    apt-get install -y curl python3 build-essential; \
    curl -LO https://github.com/grpc/grpc-web/releases/download/1.2.1/protoc-gen-grpc-web-1.2.1-linux-x86_64; \
    mv protoc-gen-grpc-web-1.2.1-linux-x86_64 /usr/bin/protoc-gen-grpc-web; \
    chmod 755 /usr/bin/protoc-gen-grpc-web

WORKDIR /usr/src/app
COPY .eslintrc.js package.json yarn.lock ./ 
COPY packages/metanotes-server-api/package.json ./packages/metanotes-server-api/package.json 

WORKDIR /usr/src/app/packages/metanotes-server-api
RUN yarn
COPY ./packages/metanotes-server-api ./
RUN yarn build

FROM node:15-alpine3.12 as build

WORKDIR /usr/src/app
COPY package.json yarn.lock ./
RUN apk --update add python3 build-base; yarn
COPY . ./

WORKDIR /usr/src/app/packages/metanotes-filter
RUN yarn && yarn build

WORKDIR /usr/src/app/packages/metanotes-server-api
RUN yarn --prod
COPY --from=build_protoc /usr/src/app/packages/metanotes-server-api/lib ./lib

WORKDIR /usr/src/app/packages/metanotes-store
RUN yarn && yarn build

WORKDIR /usr/src/app/packages/remark-metareact
RUN yarn && yarn build

WORKDIR /usr/src/app/packages/metanotes-core
RUN yarn && yarn build

FROM nginx:1.12-alpine
COPY --from=build /usr/src/app/packages/metanotes-core/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

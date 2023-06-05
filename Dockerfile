FROM node:16-alpine as base
RUN npm i -g pnpm

FROM base as build
WORKDIR /root/app
COPY package.json .

RUN ["pnpm", "install", "--registry", "https://registry.npm.taobao.org"]

COPY . .
RUN pnpm build:pro

#
FROM nginx:stable

ADD ./deploy/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /root/app/dist-pro /usr/share/nginx/html

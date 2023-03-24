FROM node:16-alpine as build
WORKDIR /root/app
COPY package.json .

ENV NPM_CONFIG_LOGLEVEL warn
ENV NPM_CONFIG_REGISTRY https://registry.npm.taobao.org

RUN yarn install --loglevel notice

COPY . .
RUN yarn run build

#
FROM nginx:stable

ADD ./deploy/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /root/app/dist /usr/share/nginx/html

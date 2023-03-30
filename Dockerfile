FROM node:16-alpine as build
WORKDIR /root/app
COPY package.json .

RUN ["npm", "install", "--registry=https://registry.npmmirror.com"]

COPY . .
RUN npm run build:pro

#
FROM nginx:stable

ADD ./deploy/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /root/app/dist-pro /usr/share/nginx/html

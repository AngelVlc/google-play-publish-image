FROM node:16-alpine

ENV APP /app
WORKDIR $APP

COPY package.json package-lock.json $APP/

RUN npm install

COPY . $APP

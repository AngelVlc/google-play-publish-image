FROM node:10.15.1-jessie-slim

ENV APP /app

WORKDIR $APP
COPY package.json package-lock.json $APP/
RUN npm install
COPY . $APP

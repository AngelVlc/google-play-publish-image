FROM node:10.15.1-jessie-slim

ENV APP=/app

WORKDIR $APP
COPY . $APP

RUN npm install
FROM node:16

WORKDIR /opt/ct

COPY package.json yarn.lock ./

RUN yarn install --frozen-lock-file

COPY . .
FROM node:17

WORKDIR /usr/src/app

COPY package.json /usr/src/app/

RUN yarn
RUN yarn global add serve

COPY src ./src
COPY public ./public

RUN yarn build

CMD ["serve", "-s", "build"]

FROM node:6.9

RUN npm install nodemon webpack -g

WORKDIR /app
COPY package.json /app/
RUN npm config set registry http://registry.npmjs.org/ && npm install

COPY . /app/

RUN webpack

ENV NODE_ENV=production
ENV PORT=4000

VOLUME /app/node_modules

CMD [ "/usr/local/bin/node", "./index.js" ]

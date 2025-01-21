FROM node:alpine3.11

RUN mkdir -p /app

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE $PORT

CMD ["npm", "start"]
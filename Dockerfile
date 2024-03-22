FROM node:20

WORKDIR /app

COPY . .

RUN npm install

RUN npm run build

EXPOSE ${PORT}

CMD ["node", "dist/main.js"]
# Stage 1
FROM node:latest as build

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN npm run build

# Stage 2
FROM nginx:latest

COPY --from=build . .

EXPOSE 8080

CMD ["npm","start"]

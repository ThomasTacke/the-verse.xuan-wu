# Base image
FROM node AS base
EXPOSE 3000
WORKDIR /usr/src/app

# Prod image
FROM base AS prod
COPY package*.json ./
RUN npm install
COPY . .
CMD [ "npm", "run", "start" ]
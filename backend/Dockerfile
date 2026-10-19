FROM node:20-alpine
WORKDIR /app
COPY package* .
RUN npm i
COPY . .
EXPOSE 3001
CMD ["npm", "run", "dev"]
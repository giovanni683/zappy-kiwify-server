FROM node:20-alpine
WORKDIR /app
COPY --chown=node:node package*.json ./
RUN npm install
COPY --chown=node:node . .
RUN npx prisma generate
RUN npm run build
USER node
EXPOSE 3001/tcp
CMD [ "npm", "start" ]
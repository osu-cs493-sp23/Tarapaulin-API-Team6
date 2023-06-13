FROM node:18
WORKDIR /usr/src/app
COPY . .
RUN npm install
ENV PORT=8000
EXPOSE ${PORT}
# Multi command to init db then start the server
# Might want to change this
CMD npm start
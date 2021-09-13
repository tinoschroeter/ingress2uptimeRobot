FROM node:14-buster AS uptime

RUN apt update && apt dist-upgrade -y
RUN rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY uptime/package.json .
COPY uptime/index.js .

RUN npm install --only=production

CMD ["sleep", "10000"]

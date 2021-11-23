FROM node:16.11.1-bullseye-slim AS uptime

RUN apt-get update && apt-get dist-upgrade -y \
&& rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY uptime/package.json .
COPY uptime/index.js .

RUN npm install --only=production

CMD ["sleep", "10000"]

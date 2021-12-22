FROM node:gallium-bullseye-slim AS uptime

WORKDIR /app

COPY uptime/package.json .
COPY uptime/index.js .

RUN npm install --only=production

CMD ["sleep", "10000"]

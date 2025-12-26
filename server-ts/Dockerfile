FROM node:slim

RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install

COPY prisma ./prisma
RUN pnpm prisma generate

COPY . .

EXPOSE 3000

CMD ["sh", "-c", "pnpm prisma migrate deploy && pnpm dev"]



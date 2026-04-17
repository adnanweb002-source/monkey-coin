# ---------- BUILD ----------
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build


# ---------- EXPORT ONLY ----------
FROM alpine:3.19

WORKDIR /app

COPY --from=builder /app/dist ./dist

CMD ["sh", "-c", "echo 'build ready' && sleep infinity"]
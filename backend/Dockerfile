FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY tsconfig*.json nest-cli.json ./
COPY src ./src
COPY scripts ./scripts
RUN npm run build

EXPOSE 3000

# Create uploads directory for static product images
RUN mkdir -p /app/uploads/products

# Do not run seed:catalogue on every boot — it upserts products and used to reset every price to 0.
# Catalogue: run once when bootstrapping (`npm run seed:catalogue`) or after rebuild, not on each restart.
CMD ["sh", "-c", "npm run db:migrate:deploy && npm run start:prod"]

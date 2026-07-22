FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy Prisma schema and migrations
COPY prisma ./prisma/
RUN npx prisma generate

# Copy source files
COPY . .

# Build typescript project
RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]

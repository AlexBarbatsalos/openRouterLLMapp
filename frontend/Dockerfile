FROM node:20-alpine

WORKDIR /app

COPY . /app

RUN npm install
RUN npm run build

# Use a tiny web server to serve the dist
RUN npm install -g serve
CMD ["serve", "-s", "dist", "-l", "3000"]

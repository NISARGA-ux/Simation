# FRONTEND BUILD
FROM node:20 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend ./
# Make sure Vite is installed locally
RUN npm install vite
RUN npm run build

# BACKEND
FROM node:20
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend ./
COPY --from=frontend-build /app/frontend/dist ./dist
EXPOSE 8080
ENV PORT=8080
CMD ["node", "server.js"]

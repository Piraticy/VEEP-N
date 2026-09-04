FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS build
COPY . .
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=8080
RUN apk add --no-cache openvpn iproute2
COPY --from=build /app/dist ./dist
COPY --from=build /app/lib ./lib
COPY --from=build /app/server.cjs ./server.cjs
EXPOSE 8080
CMD ["node", "server.cjs"]

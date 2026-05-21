FROM oven/bun:1 AS build
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --ignore-scripts
COPY . .
RUN bun run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
RUN sed -i 's/listen       80;/listen       3000;/' /etc/nginx/conf.d/default.conf && \
  sed -i 's/listen  \\[::\\]:80;/listen  [::]:3000;/' /etc/nginx/conf.d/default.conf
EXPOSE 3000

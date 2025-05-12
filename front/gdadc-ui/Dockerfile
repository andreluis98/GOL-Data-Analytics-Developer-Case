# Stage 1: build
FROM node:18 AS node

WORKDIR /gdadc
COPY . .
RUN npm install
RUN npm run build

# Stage 2: nginx
FROM nginx:alpine

EXPOSE 80
EXPOSE 443

COPY ./nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=node /gdadc/dist/gdadc-ui/browser /usr/share/nginx/html


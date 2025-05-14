# Stage 1: build
FROM node:18 AS node


# Set work directory
WORKDIR /gdadc

# Copy project
COPY . .

# Build project
RUN npm install
RUN npm run build

# Stage 2: nginx
FROM nginx:alpine

# Expose ports
EXPOSE 80
EXPOSE 443

# Copy config file
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Copy project
COPY --from=node /gdadc/dist/gdadc-ui/browser /usr/share/nginx/html


FROM node:20.16.0 AS build-stage
WORKDIR /build
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN make build

FROM nginx AS runtime-stage
COPY --from=build-stage /build/dist/* /usr/share/nginx/html/

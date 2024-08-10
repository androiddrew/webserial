FROM nginx
COPY ./src/index.html ./src/script.js ./src/main.css /usr/share/nginx/html

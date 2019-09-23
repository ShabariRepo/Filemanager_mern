FROM node:alpine as builder

#this is for any proxys if needed
#below is for ...13.9 'DEV'
ENV http_proxy http://10.228.12.41:8888
ENV https_proxy http://10.228.12.41:8888

WORKDIR '/app'
COPY package.json .
RUN npm install
COPY . .
RUN npm run build

FROM nginx
COPY --from=builder /app/build /usr/share/nginx/html

FROM node:alpine 

#this is for any proxys if needed
#below is for ...13.9 'DEV'
# ENV http_proxy http://10.228.12.41:8888
# ENV https_proxy http://10.228.12.41:8888

WORKDIR '/server/app'
COPY package.json .
COPY . .
RUN npm install --save mysql
RUN npm install

RUN npm install -g nodemon
# CMD [ "nodemon", "server.js" ]
# nodemon ./server.js

# FROM nginx
# COPY --from=builder /app/build /usr/share/nginx/html

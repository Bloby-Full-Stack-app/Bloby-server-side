FROM node:16
WORKDIR /home/node/app


# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
RUN apt-get -y update
RUN apt-get -y upgrade
RUN apt-get install -y ffmpeg
RUN npm install
# If you are building your code for production
# RUN npm ci --only=production
# Bundle app source
COPY . .    
EXPOSE 9090
CMD ["npm","start"]
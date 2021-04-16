# API server for IAHSP EU
#
# @author Gabriel Tumbaga <gabriel@iahsp.com
# @version 20200814

# use node
#FROM node:12.18-alpine3.9
 FROM node:12.18.3

# set working directory
WORKDIR /

# bundle source code
# .dockerignore has been created to ignore certain stuff from being copied
COPY . .

# Install deps.
# RUN npm install --production
RUN npm install

# Typescript not being used...
# Convert Typescript to JS.
#RUN npm run build-server

# expose port for app
#EXPOSE 5000

# start app
CMD ["npm", "start"]

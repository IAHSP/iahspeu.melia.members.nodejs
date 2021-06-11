# API server for IAHSP EU
#
# @author Gabriel Tumbaga <gabriel@iahsp.com
# @version 20200814

# Build Image
# 1. docker build -t iahspeu-api:<version> .
#    example:
#      docker build -t iahspeu-api:0.0.1 .
# 2. Update docker-compose.yaml to use new image.

# RELEASE NOTES
# 0.0.1 - Initial
# 0.0.2 - removed 'undefined' from cors whitelist, and added members and members-staging subdomains
# 0.0.3 - got robots.txt working, and also added cors whitelist to docker-compose files for easy editing
# 0.0.4 - got unrequired fields working, introduced an asyncawait foreach, and accepting different file types for certificates
# 0.0.5 - made changes to grab charged price from req, and use EUR instead of USD
# 0.0.6 - fixed price, added billing details
# 0.0.7 - admin add user, and fixed email text, and reply-to

# use node
FROM node:12.18-alpine3.9
#FROM node:12.18.3

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
# exposing in docker-compose instead
#EXPOSE 5000

# start app
# starting in docker-compose instead...
#CMD ["npm", "start"]

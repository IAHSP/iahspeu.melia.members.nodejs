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

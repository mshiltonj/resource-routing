FROM node:20-slim

RUN apt-get update && apt-get install -y git vim curl procps 

USER node


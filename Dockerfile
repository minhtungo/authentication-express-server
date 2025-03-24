FROM --platform=linux/amd64 node:18
RUN apt-get update -y && apt-get upgrade -y

RUN apt-get install -y unzip sudo build-essential

RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
RUN unzip awscliv2.zip
RUN sudo ./aws/install

WORKDIR /home/app

COPY . .

# FROM node:22.14.0-slim

# # Create app directory
# WORKDIR /usr/src/app

# # Copy package.json and package-lock.json
# COPY package*.json ./

# # Install app dependencies
# RUN npm install -g pnpm
# RUN pnpm install --frozen-lockfile

# # Bundle app source
# COPY . .

# # Build the TypeScript files
# RUN pnpm run build

# # Expose port 8080
# EXPOSE 8080

# # Start the app
# CMD pnpm run start

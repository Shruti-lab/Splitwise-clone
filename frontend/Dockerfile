FROM node:20-alpine

WORKDIR /app

# Install yarn
RUN apk add --no-cache yarn

# Copy package files
COPY package.json yarn.lock* ./

# Install dependencies
RUN yarn install --frozen-lockfile

COPY . .

# Build the app
RUN yarn build

# Install serve to run the application
RUN yarn global add serve

EXPOSE 5173

# Command to run the application
CMD ["yarn", "dev", "--host"]

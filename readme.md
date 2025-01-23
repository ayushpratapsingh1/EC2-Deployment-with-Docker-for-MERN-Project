ssh -i ~/.ssh/new.pem ec2-user@65.1.109.138
docker-compose up --build
name: Deploy to EC2

on:
  push:
    branches:
      - main

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout code
      uses: actions/checkout@v3

    - name: Log in to Docker Hub
      env:
        DOCKER_USERNAME: ${{ secrets.DOCKER_USERNAME }}
        DOCKER_PASSWORD: ${{ secrets.DOCKER_PASSWORD }}
      run: echo "${DOCKER_PASSWORD}" | docker login -u "${DOCKER_USERNAME}" --password-stdin

    - name: Build frontend
      run: |
        cd frontend
        npm install
        npm run build
        cd ..

    - name: Copy frontend build to server
      run: |
        rm -rf server/dist # Clean previous build
        cp -r frontend/dist server/ # Copy new build to server folder

    - name: Build and push server image
      env:
        DOCKER_USERNAME: ${{ secrets.DOCKER_USERNAME }}
      run: |
        docker build -t ${{ secrets.DOCKER_USERNAME }}/login-server:latest ./server
        docker push ${{ secrets.DOCKER_USERNAME }}/login-server:latest

    - name: Upload files to EC2
      uses: appleboy/scp-action@v0.1.6
      with:
        host: ${{ secrets.EC2_PUBLIC_IP }}
        username: ${{ secrets.EC2_USER }}
        key: ${{ secrets.PRIVATE_KEY }}
        source: "./"
        target: "/home/${{ secrets.EC2_USER }}/Login"

    - name: Deploy to EC2
      uses: appleboy/ssh-action@v0.1.6
      with:
        host: ${{ secrets.EC2_PUBLIC_IP }}
        username: ${{ secrets.EC2_USER }}
        key: ${{ secrets.PRIVATE_KEY }}
        script: |
          cd /home/${{ secrets.EC2_USER }}/Login
          export AWS_REGION=${{ secrets.AWS_REGION }}
          export MONGODB_SECRET_NAME=${{ secrets.MONGODB_SECRET_NAME }}
          export AWS_ACCESS_KEY_ID=${{ secrets.AWS_ACCESS_KEY_ID }}
          export AWS_SECRET_ACCESS_KEY=${{ secrets.AWS_SECRET_ACCESS_KEY }}
          docker-compose down --volumes --remove-orphans
          docker rm -f login-server || true
          docker-compose pull
          docker-compose up -d --force-recreate



version: '3.8'

services:
  server:
    build:
      context: ./server
      dockerfile: Dockerfile
    ports:
      - "3000:3000" # Expose the backend port (serves both API and frontend)
    environment:
      - PORT=3000
      - AWS_REGION=${AWS_REGION}
      - MONGODB_SECRET_NAME=${MONGODB_SECRET_NAME}
      - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
      - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
    restart: unless-stopped


    docker rmi $(docker images -q)
    docker rm $(docker ps -aq)
    docker rm -f $(docker ps -aq)



    services:
  frontend:
    image: ${DOCKER_USERNAME}/login-frontend:latest
    ports:
      - "80:80"
    depends_on:
      - backend

  backend:
    image: ${DOCKER_USERNAME}/login-backend:latest
    expose:
      - "3000"
    environment:
      - PORT=3000
      - AWS_REGION=${AWS_REGION}
      - MONGODB_SECRET_NAME=${MONGODB_SECRET_NAME}
      - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
      - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
    restart: unless-stopped

volumes:
  mongodb_data:
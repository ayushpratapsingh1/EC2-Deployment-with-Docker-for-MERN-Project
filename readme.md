ssh -i ~/.ssh/new.pem ec2-user@65.1.109.138
docker-compose up --build
docker rmi $(docker images -q)
docker rm $(docker ps -aq)
docker rm -f $(docker ps -aq)
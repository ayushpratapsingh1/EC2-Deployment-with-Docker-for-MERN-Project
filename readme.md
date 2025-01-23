ssh -i ~/.ssh/new.pem ec2-user@65.1.109.138
docker-compose up --build
docker rmi $(docker images -q)
docker rm $(docker ps -aq)
docker rm -f $(docker ps -aq)
cd /etc/nginx/conf.d/
sudo lsof -i :80
sudo systemctl reload nginx
sudo systemctl restart nginx
sudo systemctl status nginx.service
sudo nano /etc/nginx/nginx.conf
sudo nano docker-compose.yml
cd /etc/nginx/conf.d/
sudo nano /etc/nginx/conf.d/default.conf
curl -v https://loginaps.duckdns.org
sudo certbot --nginx -d loginaps.duckdns.org
sudo yum install -y certbot-nginx
sudo nginx -t
sudo yum install -y certbot python3-certbot-nginx
curl -v https://localhost
sudo netstat -tulnp | grep :443
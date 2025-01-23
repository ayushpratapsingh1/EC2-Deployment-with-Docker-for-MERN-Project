# EC2 Deployment with Docker and SSL for MERN Project

I created this to deliver a fully functional, secure user registration and login experience, hosted on AWS. Below, I’ll walk you step-by-step through provisioning the infrastructure with Terraform, developing a React + Node.js application, containerizing with Docker, implementing a CI/CD pipeline, and finally securing it with SSL via Let’s Encrypt.

---

## Prerequisites

• AWS account with an EC2 key pair (used to SSH into the instance).  
• Terraform installed on your local machine (for infrastructure as code).  
• Docker Engine (can be on your local machine or directly on the EC2 instance).  
• GitHub account to store repository secrets (used for CI/CD).  
• Basic familiarity with React, Node.js, environment variables, and shell operations.

For deeper knowledge, consult:  
• Terraform Docs: [https://developer.hashicorp.com/terraform/docs](https://developer.hashicorp.com/terraform/docs)  
• Docker Docs: [https://docs.docker.com/](https://docs.docker.com/)  
• Node.js Docs: [https://nodejs.org/en/docs](https://nodejs.org/en/docs)  
• React Docs: [https://react.dev/](https://react.dev/)  
• Certbot: [https://certbot.eff.org/](https://certbot.eff.org/)  
• Nginx: [https://docs.nginx.com/](https://docs.nginx.com/)

---

## 1. Terraform Provisioning

I began by creating foundational AWS resources with Terraform:

• VPC (Virtual Private Cloud) to isolate my network.  
• Public Subnet linked to an Internet Gateway for external access.  
• Security Group allowing inbound traffic on ports 22 (SSH), 80 (HTTP), and 443 (HTTPS).  
• EC2 instance configured with an IAM role giving read access to AWS Secrets Manager (for storing MongoDB credentials).

### Key Commands
```bash
terraform init   # Prepares plugins/providers
terraform plan   # Previews infrastructure changes
terraform apply  # Creates or updates infrastructure
```

### Challenges Faced
I initially struggled to write minimal yet valid IAM policies for Secrets Manager. By reviewing official Terraform documentation and iteratively refining the policy, I finally restricted access to only necessary ARNs.

---

## 2. React Frontend & Node Backend

Once the EC2 instance was up, I built a React application with Vite for frontend pages (Login, Register, Welcome) and a Node.js/Express backend connected to MongoDB Atlas. Environment variables were managed locally using .env files and stored credentials in AWS Secrets Manager.

• Frontend: Includes pages for user registration and login, with a final “Welcome” screen.  
• Backend: Handles incoming requests, registration, login logic, and retrieves secrets from Secrets Manager to connect with MongoDB.

### Frequently Used Commands
```bash
# In the frontend directory
npm install
npm run dev

# In the backend directory
npm install
npm start
```

### Challenges Faced
I had trouble at first ensuring the “dist” folder was served effectively from the Node server. Once the frontend was built with Vite and output files copied to the server folder, both client and server ran smoothly on a single port.

---

## 3. Docker Containerization

To standardize deployments across local and production environments, I created Dockerfiles. My approach was:

• Build the frontend with Vite, generating a “dist” folder.  
• Copy that “dist” output into the backend container so everything runs on port 3000 (or whichever port you configure).  
• Use Docker Compose for local testing, easily spinning up containers.

### Common Docker Commands
```bash
# Build and run local containers with Docker Compose
docker-compose up --build

# Remove images and networks if they persist
docker-compose down --rmi all
docker system prune -af
```

### Challenges Faced
Old images persisted on the EC2 instance. I discovered that removing or pruning these images before downloading new ones was essential, preventing the container from using outdated builds.

Also, to run Docker without sudo on EC2:
```bash
sudo usermod -a -G docker ec2-user
sudo systemctl enable docker
sudo systemctl start docker
```

---

## 4. CI/CD with GitHub Actions

I automated my build and deployment strategy by setting up a GitHub Actions workflow:

• Source code push triggers the pipeline.  
• Docker images are built, tagged, and pushed to Docker Hub.  
• Workflow then SSHs into the EC2 instance to pull and run the latest image.

### Typical GitHub Actions Example
```yaml
on:
  push:
    branches: [ "main" ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Check out repository
        uses: actions/checkout@v2
      # ...
```

### Challenges Faced
I found it tricky to map GitHub secrets (e.g., AWS_ACCESS_KEY_ID, DockerHub credentials) into the workflow. Experimenting and verifying environment variables eventually let me deploy seamlessly from GitHub to my EC2 instance.

---

## 5. SSL with Let’s Encrypt & Nginx

Lastly, I secured the website:

• Acquired a DuckDNS subdomain pointing to my EC2 public IP.  
• Installed Nginx and Certbot to generate a free SSL certificate via Let’s Encrypt.  
• Adjusted the Nginx config to redirect all traffic on port 80 to port 443.

### Sample Commands for SSL Setup
```bash
sudo yum install -y certbot python3-certbot-nginx
sudo certbot --nginx -d myapp.duckdns.org
sudo nginx -t
sudo systemctl restart nginx
curl -v https://myapp.duckdns.org
```

### Challenges Faced
I initially forgot to open ports 80 and 443 in the security group, causing certificate issuing to fail. Once the ports were unblocked, Certbot succeeded, and the site was served securely over HTTPS.

---

## Extended Details & Best Practices

This section dives deeper into each stage of the process, providing broader context, tips, and some lessons learned.

### Additional Insights on Terraform Provisioning

When I started, I discovered Terraform’s power in version control and repeatable infrastructure. Keeping your AWS resources defined in .tf files ensures that changes can be tracked via source control systems (like Git) and easily rolled back if needed. Another best practice is to store environment-specific configurations in separate .tfvars files (for example, dev, staging, production), so you can quickly switch between environments without manually editing variables. This approach also helps mitigate human error by removing repeated copy-paste tasks.

One key takeaway is the importance of IAM least-privilege principles. While it might be tempting to give your EC2 instance broad AWS access, limiting the instance’s ability to only read Secrets Manager values fosters a more secure environment. If you plan on scaling your configuration, consider modules to encapsulate your VPC, subnets, or security group logic for reusability. Additionally, referencing the official modules from the Terraform Registry can save time in the future.

### More on React & Node Setup

When building the frontend with Vite, I appreciated its faster development server compared to older tooling. If you choose to handle environment variables for React, remember that simply storing them in a local .env file doesn’t obfuscate them in production. If a variable is used client-side, it’s inherently visible in the browser’s source or dev tools. That said, storing less sensitive environment data (e.g., API endpoints) is acceptable, but secrets (like JWT keys or database credentials) belong on the server side or in Secrets Manager.

For Node.js, because it plays a crucial role in bridging the frontend and MongoDB, robust error handling is essential. Adding structured logging (e.g., using libraries like Winston or Pino) can make production debugging simpler. Moreover, employing linting (ESLint) and formatting (Prettier) fosters code consistency. Another valuable tip is to separate your Express routes logically (e.g., userRoutes.js, authRoutes.js) instead of keeping everything in app.js. This helps maintain clarity as your application grows.

### Expanded Docker Considerations

Dockerizing each piece of your stack ensures that every environment runs the same code with the same dependencies. You might further optimize your Dockerfiles by using multi-stage builds, especially if your final container requires minimal runtime dependencies. For instance, the Node.js build stage could compile TypeScript or bundle React assets, and the final stage might only contain the necessary files to run the app.

Keeping Docker images small saves network bandwidth and disk space. If you push images to Docker Hub often (especially via CI/CD), smaller images mean faster builds and deployments. Tools like Dive can help visualize what’s adding bulk to your images. If you need a more advanced approach, you might consider container registry scanning solutions to detect vulnerabilities in included packages.

### CI/CD Pointers with GitHub Actions

Managing secrets in GitHub is integral to a secure pipeline. By storing AWS credentials, Docker login tokens, and other sensitive data in GitHub Secrets, you can keep them out of the repository and reduce the risk of accidental exposure. Inside your workflow, environment variables that reference these secrets can pass them into build steps.

If you expand your pipeline logic, you can also integrate notifications (e.g., Slack alerts for failures) or automated tests (e.g., unit tests, integration tests) before Docker images are built. This ensures that broken code never makes it to production. Another trick is to use “manual approval” steps in your pipeline when deploying to critical environments like production or when you want to sign off on final checks.

### SSL with Let’s Encrypt & Nginx – Going Deeper

SSL not only protects user data but also increases user trust. Nginx provides a simple approach to handle reverse proxies and static file serving at scale. In more complex setups, you might terminate SSL on a load balancer (e.g., AWS ALB) instead of directly on your EC2 instance. This approach can help if you run multiple Docker containers or services on a single host.

Let’s Encrypt certificates do expire every 90 days, so schedule crontab tasks (or use Certbot’s built-in renewal timers) to automatically renew them. Periodically verify that the renewal process is functioning—some certificates fail to renew if domain DNS or port 80 is blocked. As your architecture grows, consider an upstream CDN or WAF (Web Application Firewall) to help mitigate DDOS attacks and cache static assets for performance.

### Broader Lessons Learned

1. Version Control Everything: From Terraform configuration to your Docker files and Nginx configs, keep them in a repository. This eliminates confusion around “which version is deployed?” and fosters collaboration.
2. Automate Early: Manual deployments can become too cumbersome after a few changes or multiple environments. Automating with GitHub Actions or another CI/CD solution helps maintain consistency.
3. Security Mindset: Always store secrets in a dedicated vault or AWS Secrets Manager. Exposing passwords or keys in code or logs is a common pitfall that can lead to severe breaches.
4. Monitoring & Logging: As soon as you move into production, set up basic health checks (like the /health endpoint in Express) and server logs. Logging clarity helps troubleshoot failing deployments or user-reported bugs.
5. Scalability & Load Balancing: While a single EC2 instance might suffice early on, be ready to scale horizontally or vertically as you gain users. That might involve AWS services like ECS (Elastic Container Service), EKS (Elastic Kubernetes Service), or an Auto Scaling Group if you stick to raw EC2.

### On Overcoming Challenges

Building a project from the ground up introduced a broad range of potential pitfalls—from Terraform misconfiguration to Docker caching quirks and inconsistent environment variables. Yet, these issues also represent important learning milestones. I encountered each stumbling block with curiosity, always digging deeper into documentation and community forums until finding a workable solution.

For instance, I spent considerable time diagnosing why new Docker images didn’t appear on refresh. Realizing that the old container was still in use (and not properly removed) illustrated the importance of thoroughly cleaning up images between builds. Another challenge was ensuring stable connectivity between the frontend and backend once I merged them into a single container, a feat accomplished by consistently referencing environment variables and verifying that both sides listened on the correct port.

### Future Enhancements

• Deploying to ECS or EKS: If growth demands auto-scaling, container orchestration solutions in AWS can handle ephemeral containers more gracefully than a single EC2.  
• Infrastructure Modules: Breaking the Terraform configuration into modules for the VPC, subnets, or security groups can keep code organized for bigger teams.  
• Database Connectivity: Investigate solutions for better database scaling, like AWS DocumentDB or using read replicas in MongoDB Atlas if the user base expands rapidly.  
• Observability Stack: Incorporating metrics (Prometheus, Grafana) or logging pipelines (ELK stack) would help fine-tune performance and error monitoring.  
• Additional Security Layers: WAF, intrusion detection, or AWS Shield can provide extra layers of defense, especially for public-facing endpoints.

In summation, SpeakX underscores both the challenges and rewards of full-stack development in the cloud. From a single instance with Terraform to a multi-stage Docker build and eventually an automated CI/CD pipeline, every piece of the puzzle demonstrates how modern cloud apps can be built with efficiency and security in mind. Embracing these best practices and focusing on small, incremental improvements can refine your system over time, proving that the learning process never truly ends.

---

## Conclusion

Throughout this project, I leaned heavily on documentation and trial-and-error. The five segments—Terraform provisioning, building the React & Node app, containerization with Docker, automating with GitHub Actions, and finally adding SSL—required persisting through errors and refining configurations.

Key lessons I took away:  
1. Terraform’s approach to infrastructure as code is powerful, but demands clarity with IAM policies.  
2. Storing secrets in AWS Secrets Manager helps keep sensitive information off public repositories.  
3. Docker Compose simplifies local testing before committing to production.  
4. GitHub Actions eliminates manual rebuilds and deployments.  
5. Let’s Encrypt, through Certbot and Nginx, provides a straightforward path to HTTPS without extra costs.

By following each step methodically, you can replicate or expand this full-stack deployment for your own use cases. Should hurdles arise, remember they’re part of the learning journey—and rely on official docs or community forums for help. Happy coding!
## Technologies we will use for this project

1: Microservice Architecture 
2: Monorepo tools (nx.dev) for codebase orginazation
3: AWS for deployment and production
4: nodejs/express.js for backend
5: mondodb for primary database
6: Redis for Secondry Database
7: prisma database ORM
8: nextjs for frontend
9: kafka for message broker
10: jest for api testing
11: swagger for API Doces
12: TensorFlow.js for mechine learning framwork
13: web socket for real time data 
14: Firebase for web push notification
15: imagekit.io for upload image
16: docker for containerization
17: github for ci/cd
18: cloudfare for domain management
  



there are two types of repos for manging architure which is Monorepo and Polyrepo:

Monorepo and Polyrepo are two approaches to organizing codebases, especially when dealing with multiple projects or components in software development. Here's a breakdown of each:

🔹 Monorepo (Monolithic Repository)
Definition:
A monorepo (short for monolithic repository) is a single version-controlled repository that contains the code for multiple projects or components, often related or part of the same organization or ecosystem.

Example:

bash
Copy
Edit
/repo
  /frontend
  /backend
  /shared-libraries
  /scripts
Used by: Google, Facebook, Uber, Nx, Turborepo, etc.

Advantages:

✅ Easier code sharing and refactoring across projects.

✅ Unified versioning and dependency management.

✅ Consistent tooling and configuration (e.g., ESLint, Prettier).

✅ Simplified CI/CD pipelines.

✅ Better visibility across the organization.

Disadvantages:

❌ Can become large and complex to manage.

❌ Requires tools (like Nx, Turborepo, or Bazel) for efficient builds and dependency tracking.

❌ Potential performance issues with version control systems if not handled properly.

🔹 Polyrepo (Multiple Repositories)
Definition:
A polyrepo approach keeps each project or component in its own separate version-controlled repository.

Example:

github.com/org/frontend-app

github.com/org/backend-api

github.com/org/shared-utils

Used by: Many smaller teams or organizations with independent services.

Advantages:

✅ Clear separation of concerns.

✅ Smaller, more focused repositories.

✅ Independent deployment and versioning.

✅ Easier access control per project.

Disadvantages:

❌ Harder to share code between repositories.

❌ More effort to coordinate changes across repos.

❌ CI/CD pipelines need to be managed separately.

❌ Version mismatches between shared components.

🚀 When to Use What?
Scenario	Best Choice
Large, integrated system with many shared components	Monorepo
Independent services with separate teams and deployment cycles	Polyrepo
You want atomic commits across multiple apps/libraries	Monorepo
Each project is maintained by a separate team with minimal cross-dependencies	Polyrepo

Let me know if you'd like to see examples with tools like Nx or Turborepo for Monorepos.





we are using nx for monorepo micro service architecture

// nx commands 

1: for setup monorepo project: (npx create-nx-workspace:latest .)
2: add express to generate new express apps (nx add @nx/express)
3: create new express service (nx g @nx/express:app apps/my-express-api)
4: command for generate new service without e2eTestRunner (nx g @nx/express:app api-gateway --directory=apps/api-gateway --e2eTestRunner=none)


// npx kill-port port-number

# Let Start From Api-Gateway Service:

The api-gateway service work as middleware where our frontend send request to the api-gateway then api-gateway will forward the request to other services.

1: npm install express-http-proxy cors morgan express-rate-limit swagger-ui-express axios cookie-parser


properties
- type (flat, house)
- location
- size

Filter
- type
- locations
- sizeMin
- sizeMax



# Auth Service Start

## 1: install orm

npm install prisma @prisma/client

npx prisma init 

install the prisma extention for better autcomplete

npx prisma db push

npm install ioredis nodemailer dotenv ejs

## 2: install nodemailer for sending email and ejs for templates and dotenv for envirnmaent varialbe

npm i nodemailer ejs dotenv

npm i --save-dev @types/nodemailer

npm i --save-dev @types/ejs

## 3: setup redis for secondary database 

for redis you can use https://upstash.com/

npm install ioredis

npm install --save-dev @types/ioredis


## 4: setup swagger for api documentation

npm i swagger-autogen

run command node swagger.js for getting automatice docementation








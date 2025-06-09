const swaggerAutogen = require('swagger-autogen')();
const path = require('path');

const doc = {
  info: {
    title: 'Auth Service API',
    description: 'API documentation for the Auth Service',
    version: '1.0.0',
  },
  host: 'localhost:6001',
  basePath: '/api',
  schemes: ['http'],
  tags: [
    {
      name: 'Authentication',
      description: 'Endpoints related to user authentication',
    },
  ],
};

// Use absolute paths to avoid issues when running from root
const outputFile = path.resolve(__dirname, '../swagger/swagger-output.json');
const endpointsFiles = [path.resolve(__dirname, '../src/routes/auth.routes.ts')];

swaggerAutogen(outputFile, endpointsFiles, doc);

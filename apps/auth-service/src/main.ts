import express from 'express';
import cors from 'cors';
import { errorMiddleware } from '@packages/error-handler/error-middleware';
import cookieParser from 'cookie-parser';
import autRrouter from './routes/auth.routes';
import swaggerUI from 'swagger-ui-express';
// import authSwaggerDocument from './swagger-output.json';
import authSwaggerDocument from '../swagger/swagger-output.json';



const port = process.env.PORT ? Number(process.env.PORT) : 6001;
const app = express();

// Middleware
app.use(cors({
    origin: ['http://localhost:3000'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}))

app.use(errorMiddleware);
app.use(express.json());
app.use(cookieParser());



// Routes
app.use('/api', autRrouter);

// Swagger
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(authSwaggerDocument))
app.use('/api-docs.json', (req, res) => {
    res.json(authSwaggerDocument);
});

// Health Check
// app.get('/health', (req, res) => {
//     res.status(200).send({ status: 'UP' });
// });


app.get('/api', (req, res) => {
    res.send({ 'message': 'Hello API'});
});

const server = app.listen(port, () => {
  console.log(`Auth Service is running at http://localhost:${port}/api`);
  console.log(`Swagger UI is available at http://localhost:${port}/api-docs`);
});

server.on('error', (error) => {
    console.error('Server error:', error);
});


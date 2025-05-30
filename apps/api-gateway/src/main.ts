import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import proxey from 'express-http-proxy';
import rateLimit from 'express-rate-limit';
// import swaggerUi from 'swagger-ui-express';
import cookieParser from 'cookie-parser';
// import axios from 'axios';


const app = express();

// Middleware

// cors middeware used for enabling cross-origin resource sharing 
app.use(cors({
  origin: ['http://localhost:3000'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}))

// morgan middleware used for logging HTTP requests
app.use(morgan('dev'));
// cookie-parser middleware used for parsing cookies
app.use(cookieParser());
// express.json middleware used for parsing JSON request bodies the limit is set to 100mb
app.use(express.json({ limit: '100mb' }));
// express.urlencoded middleware used for parsing URL-encoded request bodies the limit is set to 100mb
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// rate-limit middleware used for limiting the number of requests to 100 per minute

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: (req: any) => (req.user ? 1000 : 100), // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' },
  statusCode: 429,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: true, // return rate limit info in the `X-RateLimit-*` headers
  keyGenerator: (req: any, res: any) => {
    return req.ip;
  }
})

app.use(limiter);




app.use('/', proxey("http://localhost:6001"))
app.set('trust proxy', 1);





app.get('/gateway-health', (req, res) => {
  res.send({ message: 'Welcome to api-gateway!' });
});

const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
server.on('error', console.error);

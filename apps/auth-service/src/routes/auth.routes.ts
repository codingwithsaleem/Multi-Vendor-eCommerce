import express, {Router} from 'express';
import { userRegister,  verifyUserRegisteration} from '../controller/auth.controller';


const autRrouter: Router = express.Router();



autRrouter.post('/user-register', userRegister);
autRrouter.post('/user-verify', verifyUserRegisteration); 


export default autRrouter;
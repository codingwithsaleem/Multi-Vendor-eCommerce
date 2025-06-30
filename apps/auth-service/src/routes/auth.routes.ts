import express, {Router} from 'express';
import { userLogin, userRegister,  verifyUserRegisteration} from '../controller/auth.controller';


const autRrouter: Router = express.Router();



autRrouter.post('/user-register', userRegister);
autRrouter.post('/user-verify', verifyUserRegisteration); 
autRrouter.post('/user-login', userLogin);


export default autRrouter;
import express, {Router} from 'express';
import { userRegister } from '../controller/auth.controller';


const autRrouter: Router = express.Router();



autRrouter.post('/user-register', userRegister);


export default autRrouter;
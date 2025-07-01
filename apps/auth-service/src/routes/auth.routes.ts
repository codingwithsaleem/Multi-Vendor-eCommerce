import express, {Router} from 'express';
import { forgotPassword, userLogin, userRegister,  verifyUserRegisteration,verifyForgotPasswordOtp,resetPassword} from '../controller/auth.controller';


const autRrouter: Router = express.Router();



autRrouter.post('/user-register', userRegister);
autRrouter.post('/user-verify', verifyUserRegisteration); 
autRrouter.post('/user-login', userLogin);
autRrouter.post('/user-forgot', forgotPassword);
autRrouter.post('/user-forgot-verify', verifyForgotPasswordOtp);
autRrouter.post('/user-reset-password', resetPassword);

export default autRrouter;
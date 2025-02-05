import { Request, Response } from 'express';
import {checkUserLogin ,checkUserTokenLogin } from '../services/userLoginService';
import { WEBTOKEN_SECRET_KEY } from '../utils/secretKey';
import jwt from 'jsonwebtoken';

export const validateUser = async (req : Request, res : Response) =>{
    try{
        const payload = req.body;
        const checkusercredential = await checkUserLogin(payload.emailadd, payload.user_pass);
        if(checkusercredential.length==0){
            res.status(200).json({ handlervalue:0});
        } else {
            //set jsonwebtoken 
            const token = jwt.sign({
                        user_id : checkusercredential[0]["user_id"]
                        ,emailadd: checkusercredential[0]["emailadd"]
                    }
                    ,WEBTOKEN_SECRET_KEY
                    ,{expiresIn: '1d'}
            );
            res.status(200).json({ handlervalue: 1, token });
        }

    }catch(error){
        if(error instanceof Error){
            res.status(400).json({ message: error.message });
        } else {
            res.status(400).json({ message: "Unknown error occured." });
        }

    }
}

export const validateToken = async(req: Request, res: Response) =>{
    try{
        const payload = req.body;
        const decoded = jwt.verify(payload.token, WEBTOKEN_SECRET_KEY);
        if (typeof decoded === "string") {
            throw new Error("Invalid token format.");
        }
        const credentials = await checkUserTokenLogin(decoded.user_id);
        const credential = credentials[0];
        if(credential.isactive==0){
            res.status(200).json({ handlervalue:0});
        } else {
            //set new jsonwebtoken 
            const token = jwt.sign({
                user_id : credential["user_id"]
                ,emailadd: credential["emailadd"]
            }
            ,WEBTOKEN_SECRET_KEY
            ,{expiresIn: '1d'}
            );
            res.status(200).json({ handlervalue: 1, token });                        
        }
        
    } catch(error){
        if(error instanceof Error){
            res.status(400).json({ message: error.message });
        } else {
            res.status(400).json({ message: "Unknown error occured." });
        }
    }
}
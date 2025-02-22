import { Request, Response } from 'express';
import { generatenineUniqueId } from "../utils/miscFunction";
import {
    checkUserLogin
    ,checkUserTokenLogin
    ,checkEmailExist
    ,updateUserPassword
    ,getUserList 
    ,createUpdateUser
} from '../services/userLoginService';
import { WEBTOKEN_SECRET_KEY
    ,GOOGLE_EMAIL_USER
    ,GOOGLE_APP_PASSOWRD
    ,MAIL_PASSWORD_URL 
} from '../utils/secretKey';

import jwt from 'jsonwebtoken';

export const setSaveUser = async(req: Request, res : Response) =>{
    try{
        const payload = req.body;        

        jwt.verify(payload.token, WEBTOKEN_SECRET_KEY, async (err: any, decoded: any) => {
            if (typeof decoded === "string") {
                throw new Error("Invalid token format.");            
            }
            if (err) {
                res.status(200).json({ handlervalue:0, message:"Token has expired."});
            } else {
                    let user_id = "";
                    let isnew = 0;
                    if(payload.user_id==0){
                        //create new user_id
                        user_id = generatenineUniqueId();                        
                        isnew = 1;
                        //check if email already exist
                        const isexist = await checkEmailExist(payload.emailadd);
                        if(isexist[0]["isemailexist"]>0){
                            res.status(200).json({ handlervalue:2, message:"Email already exist."});
                            return;
                        }
                    } else {
                        user_id = payload.user_id;                        
                        if(payload.emailadd!=payload.oemailadd){
                            //check if email already exist
                            const isexist = await checkEmailExist(payload.emailadd);
                            if(isexist[0]["isemailexist"]>0){
                                res.status(200).json({ handlervalue:2, message:"Email already exist."});
                                return;
                            }
                        }
                    }

                    const issave = await createUpdateUser(
                        decoded.comp_id
                        ,user_id
                        ,payload.user_name
                        ,payload.user_pass
                        ,payload.contactno
                        ,payload.emailadd
                        ,payload.isadmin
                        ,payload.isactive
                        ,decoded.user_id
                        ,isnew
                    );
                    
                    if(issave==1){
                        res.status(200).json({ handlervalue:1, message:"User Created Successfully.",user_id:user_id});
                    } else {
                        res.status(200).json({ handlervalue:3, message:"User not created, an error occured. Please contact backend."});
                    }                                    
            }
        });
    } catch(error){
        if(error instanceof Error){
            res.status(400).json({ message: error.message });
        } else {
            res.status(400).json({ message: "Unknown error occured." });
        }        
    }
}

export const getUserComp = async(req: Request, res : Response) =>{
    try{
        const payload = req.body;
        jwt.verify(payload.token, WEBTOKEN_SECRET_KEY, async (err: any, decoded: any) => {
            if (typeof decoded === "string") {
                throw new Error("Invalid token format.");            
            }
            if (err) {
                res.status(200).json({ handlervalue:0, message:"Token has expired."});
            } else {                
                const userList = await getUserList(decoded.comp_id,payload.searchkey,payload.isactive);
                res.status(200).json({ handlervalue:1, message:"",userList: userList});
            }
        });
    } catch(error){
        if(error instanceof Error){
            res.status(400).json({ message: error.message });
        } else {
            res.status(400).json({ message: "Unknown error occured." });
        }        
    }
}

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
                        ,comp_id: checkusercredential[0]["comp_id"]
                    }
                    ,WEBTOKEN_SECRET_KEY
                    ,{expiresIn: '1d'}
            );
            res.status(200).json({ handlervalue: 1, token,user_name:  checkusercredential[0]["user_name"],comp_id: checkusercredential[0]["comp_id"]});
        }

    }catch(error){
        if(error instanceof Error){
            res.status(400).json({ message: error.message });
        } else {
            res.status(400).json({ message: "Unknown error occured." });
        }

    }
}

export const validateChangePasswordToken = async (req: Request, res: Response) =>{
    try{
        const payload = req.body;        
        jwt.verify(payload.token, WEBTOKEN_SECRET_KEY, async (err: any, decoded: any) => {
            if (typeof decoded === "string") {
                throw new Error("Invalid token format.");            
            }
            if (err) {
                res.status(200).json({ handlervalue:0, message:"Token has expired."});
            } else {
                //update and change password
                const issave = await updateUserPassword(payload.user_pass,decoded.emailadd);
                if(issave==1){
                    res.status(200).json({ handlervalue:1, message:"Password Changed Successfully."});
                } else {
                    res.status(200).json({ handlervalue:2, message:"Password not changed, an error occured. Please contact backend."});
                }
            }
        });

    } catch(error){
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
                ,comp_id: credential["comp_id"]
            }
            ,WEBTOKEN_SECRET_KEY
            ,{expiresIn: '1d'}
            );
            res.status(200).json({ handlervalue: 1, token, user_name: credential["user_name"], comp_id: credential["comp_id"] });                        
        }
        
    } catch(error){
        if(error instanceof Error){
            res.status(400).json({ message: error.message });
        } else {
            res.status(400).json({ message: "Unknown error occured." });
        }
    }
}

export const resetPasswordMail = async(req: Request, res: Response) =>{
    try {
        const payload = req.body;        
        const result = await checkEmailExist(payload.emailadd);        
        const isemailexist = result[0]["isemailexist"];
        if(isemailexist>0){
            /* create a custom URL to change password
               this url will serve as link to change password, along with the token
               The (token) create token for password change, token will expire in 15minutes
               user should change to new password within 15 minutes
            */            
            const token = jwt.sign({                
                emailadd: payload.emailadd
            }
            ,WEBTOKEN_SECRET_KEY
            ,{expiresIn: '15m'}
            );            
            const securityurl = MAIL_PASSWORD_URL+"/"+token;

            //mail exist proceed to mail function
            const nodemailer = require('nodemailer');
            // Create a transporter object using the default SMTP transport
            const transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true, // Use SSL
                auth: {
                    user: GOOGLE_EMAIL_USER, // Your Gmail address
                    pass: GOOGLE_APP_PASSOWRD // The 16-character App Password
                }
            });
            const mailcontents = `<p>いつもご利用いただきありがとうございます。<br>
            以下のURLからパスワードを変更してください：
            </p>
            <a href='`+securityurl+`'>`+securityurl+`</a>
            <p>
            このリンクの有効期限は15分です。お早めに変更を完了してください。<br>
            ※本メールは自動送信されています。返信の必要はありません。<br> 
            ※お心当たりのない場合は、本メールを無視してください。
            </p>
            `;
            // Email options
            const mailOptions = {
                from: 'リフォームシステム<rifomusapoto@gmail.com>', // Sender address
                to: payload.emailadd, // recipient
                subject: 'リフォームシステムパスワード変更のご案内', // Subject line                
                html: mailcontents // HTML body
            };
            // Send email
            let mailmessageid = "";
            transporter.sendMail(mailOptions, (error: any, info: { messageId: any; }) => {
                if (error) {
                    return console.log('Error occurred:', error);
                }
                /*
                console.log('Email sent:', info.messageId);
                console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
                */
                mailmessageid = info.messageId;
                res.status(200).json({ handlervalue:1,message: "Mail sent.",mailmessageid:mailmessageid});
            });            
        } else {
            res.status(200).json({ handlervalue:0,message: "Mail does not exist."});
        }
    } catch(error){
        if(error instanceof Error){
            res.status(400).json({ message: error.message });
        } else {
            res.status(400).json({ message: "Unknown error occured." });
        }        
    }
}
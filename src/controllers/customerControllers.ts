import { Request, Response } from 'express';
import { WEBTOKEN_SECRET_KEY } from '../utils/secretKey';
import { 
    getCustomerListDB
    ,saveCustomertoDB
    ,getCusInfoDB
    ,getGenbaListDB
    ,canbeCancelledDB 
    ,customermasterDeletetoDB
    ,customermasterUndeletetoDB
} from '../services/customerService';
import jwt from 'jsonwebtoken';

export const customermasterUndelete = async(req: Request, res: Response) =>{
    try{
        const payload = req.body;
        jwt.verify(payload.token, WEBTOKEN_SECRET_KEY, async (err : any, decoded : any) => {
            if(err){
                throw new Error("Token Expired");
            } else {
                const compsave = await customermasterUndeletetoDB(decoded.comp_id,payload.cus_id);
                res.status(200).json({handlervalue : compsave, cusinfo:[],canbecancelled : 0});
            }
        });        
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ handlervalue : 0, message: error.message });            
        } else {
            res.status(400).json({ handlervalue : 0, message: 'An unknown error occurred' });
        }
    }          
}

export const customermasterDelete = async(req: Request, res: Response) =>{
    try{
        const payload = req.body;
        jwt.verify(payload.token, WEBTOKEN_SECRET_KEY, async (err : any, decoded : any) => {
            if(err){
                throw new Error("Token Expired");
            } else {
                const compsave = await customermasterDeletetoDB(decoded.comp_id,payload.cus_id,decoded.user_id,payload.delete_reason);
                res.status(200).json({handlervalue : compsave, cusinfo:[],canbecancelled : 0});
            }
        });        
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ handlervalue : 0, message: error.message });            
        } else {
            res.status(400).json({ handlervalue : 0, message: 'An unknown error occurred' });
        }
    }      
}

export const canbeCancelled = async(req: Request, res: Response) =>{
    try{
        const payload = req.body;
        jwt.verify(payload.token, WEBTOKEN_SECRET_KEY, async (err : any, decoded : any) => {
            if(err){
                throw new Error("Token Expired");
            } else {
                const canbecancelledcount = await canbeCancelledDB(decoded.comp_id,payload.cus_id);
                res.status(200).json({handlervalue : 1, cusinfo:[],canbecancelled : canbecancelledcount[0].notdeletedcount});
            }
        });        
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ handlervalue : 0, message: error.message });            
        } else {
            res.status(400).json({ handlervalue : 0, message: 'An unknown error occurred' });
        }
    }  
}

export const getGenbaList = async (req: Request, res: Response) => {
    try{
        const payload = req.body;
        jwt.verify(payload.token, WEBTOKEN_SECRET_KEY, async (err : any, decoded : any) => {
            if(err){
                throw new Error("Token Expired");
            } else {
                const soudanlist = await getGenbaListDB(decoded.comp_id
                    ,payload.cus_id
                    ,payload.page
                    ,payload.pageSize
                );
                res.status(200).json({handlervalue : 1,soudalist: soudanlist.rows ,soudancount: soudanlist.rowsCount[0].total});
            }
        });
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ handlervalue : 0, message: error.message });            
        } else {
            res.status(400).json({ handlervalue : 0, message: 'An unknown error occurred' });
        }
    }
}

export const getCusInfo = async(req: Request, res: Response) =>{
    try{
        const payload = req.body;
        jwt.verify(payload.token, WEBTOKEN_SECRET_KEY, async (err : any, decoded : any) => {
            if(err){
                throw new Error("Token Expired");
            } else {
                const cusinfo = await getCusInfoDB(decoded.comp_id,payload.cus_id);                
                res.status(200).json({handlervalue : 1,cusinfo: cusinfo,canbecancelled:0});
            }
        });
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ handlervalue : 0, message: error.message });            
        } else {
            res.status(400).json({ handlervalue : 0, message: 'An unknown error occurred' });
        }
    }
}

export const saveCustomer = async(req: Request, res: Response) =>{
    try{
        const payload = req.body;
        jwt.verify(payload.token, WEBTOKEN_SECRET_KEY, async (err : any, decoded : any) => {            
            if(err){
                throw new Error("Token Expired");
            } else {
                const [compsave, cus_id ] = await saveCustomertoDB(
                    decoded.comp_id
                    ,payload.cus_id
                    ,payload.cus_lname
                    ,payload.cus_fname
                    ,payload.cus_lname_kana
                    ,payload.cus_fname_kana
                    ,payload.zipcode
                    ,payload.prefcitytown
                    ,payload.banchi
                    ,payload.contactno
                    ,payload.faxno
                    ,payload.email
                    ,payload.br_id
                    ,payload.lat
                    ,payload.lng
                    ,payload.birthdate
                    ,payload.tanto_id
                    ,decoded.user_id                    
                );
                if(compsave==1){
                    res.status(200).json({handlervalue : 1,cus_id : cus_id});
                } else {
                    res.status(200).json({handlervalue : 0,cus_id : cus_id});
                }
            }
        });
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ handlervalue : 0, message: error.message });
        } else {
            res.status(400).json({ handlervalue : 0, message: 'An unknown error occurred' });
        }
    }
}

export const getCustomerList = async(req: Request, res: Response) =>{
    try{
        const payload = req.body;
        jwt.verify(payload.token, WEBTOKEN_SECRET_KEY, async (err : any, decoded : any) => {
            if(err){
                throw new Error("Token Expired");
            } else {
                const customerdata = await getCustomerListDB(
                    decoded.comp_id
                    ,payload.br_id
                    ,payload.searchkey
                    ,payload.isactive
                );                
                res.status(200).json({handlervalue : 1, message: 'Customers Data fetched successfully', customerlist: customerdata.rows, totalrows: customerdata.rowsCount[0].total });
            }
        });

    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ handlervalue : 0, message: error.message });
        } else {
            res.status(400).json({ handlervalue : 0, message: 'An unknown error occurred' });
        }
    }
}

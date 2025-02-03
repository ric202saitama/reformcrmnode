import { Request, Response } from 'express';
import { getCompany,getCompanyUser,createCompanynUserDefault } from '../services/companyCheckuserService';



export const validatecompany = async(req : Request, res : Response) =>{
    try{
        const payload = req.body;
        const companydata = await getCompany(payload.comp_name,payload.comp_address);        
        
        if(companydata.length==0){
            //create company ID company does not exist
            //会社の名は作成する、会社マッチがありません                        
            //メールを確認、ダブル登録がNG
            const usermaildata = await getCompanyUser(payload.emailadd);
            if(usermaildata.length==0){
                //メール登録されていないの場合は次のステップ登録する
                const [compsave,usersave] = await createCompanynUserDefault(payload.comp_name
                    ,payload.comp_name
                    ,payload.comp_contactno
                    ,payload.user_name
                    ,payload.user_pass
                    ,payload.contactno
                    ,payload.emailadd
                );
                if(compsave==1 && usersave ==1){
                    res.status(200).json({ handlervalue:0, message: '登録が完了しました。' });        
                } else {
                    res.status(200).json({ handlervalue:3, message: '登録ができませんですた' });        
                }
            } else {
                //メール登録されているの場合は登録NGメッセージ表示する
                res.status(200).json({ handlervalue:2, message: 'メールアドレスは既に登録されています。' });    
            }
                        
            // res.status(200).json({ message: 'Companies fetched successfully', comp_id : comp_id });
        } else {
            res.status(200).json({ handlervalue : 1,message: '会社名は既に登録されています。'});
        }
        
        


    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ message: error.message });
        } else {
            res.status(400).json({ message: 'An unknown error occurred' });
        }
    }
}
import mysqldbpool from "../utils/dbconfig";
import { generatenineUniqueId } from "../utils/miscFunction"


export const createCompanynUserDefault = async(    
    comp_name : string
    ,comp_address : string
    ,comp_contactno : string
    ,user_name : string
    ,user_pass : string
    ,contactno : string
    ,emailadd : string
    ) => {
        //insert into company table
        const comp_idres = await createNewCompanyId();
        const comp_id = comp_idres[0]["comp_id"];
       // console.log(comp_id);
        var strSQL = `insert into company
        set
        comp_id = ?
        ,comp_name = ?
        ,comp_address = ?
        ,comp_contactno = ?
        ,created_date = CURDATE()
        ,created_datetime = NOW()
        on duplicate key update
        created_datetime = NOW()
        `;
        var compsave = 1
        try {
            await mysqldbpool.execute(strSQL, [comp_id, comp_name, comp_address, comp_contactno]);            
        } catch{
            compsave = 0;
        }
        
        //insert into usermaster 
        const user_id = generatenineUniqueId();
        // console.log(user_id);
        var strSQL =  `insert into usermaster
        set
        comp_id = ?
        ,user_id = ?
        ,user_name = ?
        ,user_pass = md5(?)
        ,contactno = ?
        ,emailadd = ?
        ,isadmin = 1
        ,isactive = 1 
        ,added_datetime = NOW()
        ,added_by = 'system'
        on duplicate key update
        modified_datetime = NOW()
        ,modified_by = 'system'
        `;
        var usersave = 1;
        try{
           await mysqldbpool.execute(strSQL,[comp_id,user_id,user_name,user_pass,contactno,emailadd]);            
        } catch(error){
            console.log(error);
            usersave = 0;
        }

        return [compsave,usersave];
}

export const getCompany = async(comp_name : string,comp_address : string) =>{
    const strSQL = `select
    *
    from
    company 
    where
    comp_name = '${comp_name}'
    and comp_address = '${comp_address}'    
    `;
    const [rows] = await mysqldbpool.query(strSQL);
    return rows as any[];
}

export const getCompanyUser = async(emailadd : string) =>{
    const strSQL = `select
    *
    from
    usermaster
    where
    emailadd = '${emailadd}'
    `;
    const [rows] = await mysqldbpool.query(strSQL);
    return rows as any[];

}

export const createNewCompanyId = async() =>{
    const strSQL = `select 
                    concat(DATE_FORMAT(CURDATE(), '%y%m%d'),LPAD(count(comp_id)+1,3,0 )) comp_id
                    from
                    company
                    where
                    created_date = CURDATE()
                    `;
    const [rows] = await mysqldbpool.query(strSQL);
    return rows as any[];                    
}
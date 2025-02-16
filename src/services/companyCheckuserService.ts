import mysqldbpool from "../utils/dbconfig";
import { generatenineUniqueId } from "../utils/miscFunction";

export const saveBranchtoDB = async (
    comp_id : string
    ,br_id: string    
    ,br_name: string
    ,zipcode : string
    ,address : string
    ,banchi : string
    ,email : string
    ,telno : string
    ,faxno : string
    ,br_opendate : string
    ,br_closedate : string
    ,added_by : string
) => {
    let thisbr_id = "";
    if(br_id == "0"){
        thisbr_id = generatenineUniqueId();
    } else {
        thisbr_id = br_id;
    }
    const strSQL = `insert into branchmaster
    set
    br_id = ?
    ,comp_id = ?
    ,br_name = ?
    ,br_opendate = ?
    ,br_closedate = ?
    ,zipcode = ?
    ,prefcitytown = ?
    ,banchi = ?
    ,telno = ?
    ,faxno = ?
    ,email = ?
    ,added_by = ?
    ,added_datetime = NOW()
    on duplicate key update
    br_name = ?
    ,br_opendate = ?
    ,br_closedate = ?
    ,zipcode = ?
    ,prefcitytown = ?
    ,banchi = ?
    ,telno = ?
    ,faxno = ?
    ,email = ?
    ,modified_by = ?
    ,modified_datetime = NOW()
    `;
    var compsave = 1
    const values = [
        thisbr_id
        ,comp_id
        ,br_name
        ,br_opendate
        ,br_closedate
        ,zipcode
        ,address
        ,banchi
        ,telno
        ,faxno
        ,email 
        ,added_by 
        ,br_name
        ,br_opendate
        ,br_closedate
        ,zipcode
        ,address
        ,banchi
        ,telno
        ,faxno
        ,email 
        ,added_by              
    ];    
    try {        
        await mysqldbpool.execute(strSQL, values);            
    } catch{
        compsave = 0;
    }    

    return [compsave,thisbr_id];
}

export const getaddressfromdb = async(    
    searchkey: string
    ,page: number = 0
    ,pageSize: number = 100
) =>{
    let strSQL = `select    
    uuid() as uid
    ,zipcode
    ,concat(ken,shi,banchi) as address
    from
    zipcode_master
    where
    1=1
    `;    
    const values: any[] = [];
    if(searchkey.trim()){
        const words = searchkey.trim().split(/\s+/); // Split input into multiple words

        // Construct multiple HAVING conditions (one per word)
        const havingConditions = words.map(() => `
            (
                CONVERT(zipcode USING utf8) COLLATE utf8_unicode_ci LIKE ?
                OR CONVERT(address USING utf8) COLLATE utf8_unicode_ci LIKE ?
            )
        `).join(' AND ');  // Use AND to ensure all words appear somewhere in the row

        strSQL += ` HAVING ${havingConditions}`;
        
        // Add search parameters for each word across all fields
        words.forEach(word => {
            values.push(`%${word}%`, `%${word}%`);
        });
    }
    // **Ensure consistent ordering**
    strSQL += ` ORDER BY zipcode ASC`;    
    //query first for paging
    const strCount = `select count(*) as total from (${strSQL}) as t`;
    const [rowsCount] = await mysqldbpool.query(strCount, values);
    // Add pagination    
    strSQL += ` LIMIT ? OFFSET ?`;
    values.push(pageSize, page * pageSize);   
    /* console.log(strSQL);
    console.log(values); */
    const [rows] = await mysqldbpool.query(strSQL, values);
    return {rows: rows, rowsCount: rowsCount} as any;
}

export const getbranch = async(
    comp_id : string
    ,searchkey: string
    ,page: number = 0
    ,pageSize: number = 100
) =>{
    let strSQL = `select
    br_id
    ,br_name
    ,zipcode
    ,prefcitytown
    ,banchi
    ,telno
    ,faxno
    ,email
    ,date_format(br_opendate,'%Y/%m/%d') as br_opendate
    ,if(coalesce(br_closedate,'0000-00-00')='0000-00-00','',date_format(br_closedate,'%Y/%m/%d')) as br_closedate
    ,concat(prefcitytown,banchi) as address
    from
    branchmaster
    where
    comp_id = ?
    `;    
    const values: any[] = [comp_id];
    // Convert to string safely
    if (typeof searchkey !== "string") {
        searchkey = "";
    }    
    if(searchkey.trim()){
        const words = searchkey.trim().split(/\s+/); // Split by multiple spaces
        // Construct HAVING clause dynamically
        const havingConditions = words.map(() => 
            `CONCAT_WS(' ', convert(br_name using utf8), convert(zipcode using utf8), convert(address using utf8), convert(telno using utf8), convert(faxno using utf8), convert(email using utf8)) collate utf8_unicode_ci LIKE ?`
        ).join(' AND ');

        strSQL += ` HAVING ${havingConditions}`;
        words.forEach(word => values.push(`%${word}%`)); // Add wildcard search
    }
    // **Ensure consistent ordering**
    strSQL += ` ORDER BY added_datetime ASC`;    
    // Add pagination    
    strSQL += ` LIMIT ? OFFSET ?`;
    values.push(pageSize, page * pageSize);   
    
    const [rows] = await mysqldbpool.query(strSQL, values);
    return rows as any[];
}

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
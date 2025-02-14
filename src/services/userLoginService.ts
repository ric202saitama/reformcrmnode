import mysqldbpool from "../utils/dbconfig";

export const createUpdateUser = async(
comp_id: string
,user_id: string
,user_name: string
,user_pass: string
,contactno: string
,emailadd: string
,isadmin: number
,isactive: number
,added_by: string
,isnew: number
) =>{
    const strSQL = `insert into usermaster
    set
    comp_id = ?
    ,user_id = ?
    ,user_name = ?
    ,contactno = ?
    ,emailadd = ?
    ,isadmin = ?
    ,isactive = ?
    ,isshowlist = 1
    ,added_datetime = NOW()
    ,added_by = ?
    on duplicate key update
    modified_datetime = NOW()
    ,modified_by = ?
    ,user_name = VALUES(user_name)
    ,contactno = VALUES(contactno)
    ,emailadd = VALUES(emailadd)
    ,isadmin = VALUES(isadmin)
    ,isactive = VALUES(isactive)
    `;
    
    await mysqldbpool.execute(strSQL,[
        comp_id
        ,user_id
        ,user_name               
        ,contactno
        ,emailadd
        ,isadmin
        ,isactive        
        ,added_by        
        ,added_by        
    ]);
    
    //check password if there is a change query for password update    
    
    const strSQL2 = `select
    count(user_id) as usercount
    from
    usermaster
    where   
    user_id = ?
    and user_pass <> ?
    `;
    const [rows]: any[] = await mysqldbpool.query(strSQL2,[user_id,user_pass]);
    if(rows[0]["usercount"]>0){
        const strSQL3 = `update usermaster
        set
        user_pass = md5(?)
        where
        user_id = ?
        `;
        await mysqldbpool.query(strSQL3,[user_pass,user_id]);
    }
    if(isnew == 1){
        const strSQL3 = `update usermaster
        set
        user_pass = md5(?)
        where
        user_id = ?
        `;
        await mysqldbpool.query(strSQL3,[user_pass,user_id]);        
    }
    
    const usersave = 1;
    return usersave;
}

export const checkUserLogin = async(
    emailadd : string
    ,user_pass : string) =>{
    
    //check user credentials and return company id and set securities
    const strSQL = `select
    u.*    
    from
    usermaster u    
    where
    emailadd = ?
    and user_pass = md5(?)
    `;
    const [rows] = await mysqldbpool.query(strSQL,[emailadd,user_pass]);
    return rows as any[];    
        
}

export const checkUserTokenLogin = async(
    user_id : string
    ) =>{
        const strSQL = `select
        user_id
        ,emailadd
        ,isactive
        ,user_name
        ,comp_id
        from
        usermaster
        where
        user_id = ?
        `;
        const [rows] = await mysqldbpool.query(strSQL,[user_id]);
        return rows as any[];            
}

export const checkEmailExist = async(
    emailadd : string
    ) => {
        const strSQL = `select
        count(emailadd) isemailexist
        from
        usermaster
        where
        emailadd = ?        
        `;
        const [rows] = await mysqldbpool.query(strSQL,[emailadd]);
        return rows as any[];
}

export const updateUserPassword = async (
    user_pass : string
    ,emailadd : string    
    ) => {
        const strSQL = `update usermaster
        set
        user_pass = md5(?)
        where
        emailadd = ?
        `;
        await mysqldbpool.query(strSQL,[user_pass,emailadd]);
        const usersave = 1;
        return usersave;
}

export const getUserList = async(
    comp_id : string,
    searchkey : string,
    isactive : number = 1,    
    page: number = 0,
    pageSize: number = 100
)  => {    
    let strSQL = `select
    comp_id
    ,contactno
    ,emailadd
    ,isactive
    ,isadmin
    ,user_id
    ,user_name
    ,user_pass
    from
    usermaster
    where
    comp_id = ?
    and isactive = ?
    and isshowlist = 1
    `;
    const values: any[] = [comp_id, isactive];

     // Convert to string safely
     if (typeof searchkey !== "string") {
        searchkey = "";
    }

    if (searchkey.trim()) {
        const words = searchkey.trim().split(/\s+/); // Split by multiple spaces

        // Construct HAVING clause dynamically
        const havingConditions = words.map(() => 
            `CONCAT_WS(' ', convert(user_name using utf8), convert(emailadd using utf8), convert(contactno using utf8)) collate utf8_unicode_ci LIKE ?`
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


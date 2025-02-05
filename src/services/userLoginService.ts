import mysqldbpool from "../utils/dbconfig";
export const checkUserLogin = async(
    emailadd : string
    ,user_pass : string) =>{
    
    //check user credentials and return company id and set securities
    const strSQL = `select
    *    
    from
    usermaster
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
        from
        usermaster
        where
        user_id = ?
        `;
        const [rows] = await mysqldbpool.query(strSQL,[user_id]);
        return rows as any[];            
}
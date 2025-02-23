import mysqldbpool from "../utils/dbconfig";

export const customermasterUndeletetoDB = async(
    comp_id : string
    ,cus_id : string
) =>{
    const strSQL = `update customermaster
    set
    deleted_by = null
    ,deleted_datetime = null
    ,delete_reason = null
    where
    comp_id = ?
    and cus_id = ?
    `;
    const values: any[] = [];
    values.push(comp_id,cus_id);
    let compsave = 1;
    try {        
        await mysqldbpool.execute(strSQL, values);            
    } catch{
        compsave = 0;
    }    
    
    return compsave;    
}

export const customermasterDeletetoDB = async(
    comp_id : string
    ,cus_id : string
    ,user_id : string 
    ,delete_reason : string       
) =>{
    const strSQL = `update customermaster
    set
    deleted_by = ?
    ,deleted_datetime = NOW()
    ,delete_reason = ?
    where
    comp_id = ?
    and cus_id = ?
    `;
    const values: any[] = [];
    values.push(user_id,delete_reason,comp_id,cus_id);
    let compsave = 1;
    try {        
        await mysqldbpool.execute(strSQL, values);            
    } catch{
        compsave = 0;
    }    
    
    return compsave;    
}
export const canbeCancelledDB = async (
    comp_id : string
    ,cus_id : string        
) =>{
    const strSQL = `select
    count(kanrino) notdeletedcount
    from
    customermaster_agarimaster
    where
    comp_id = ?
    and cus_id = ?    
    and coalesce(canceldate,'0000-00-00') = '0000-00-00'
    `;
    const values: any[] = [];
    values.push(comp_id,cus_id);
    const [rows] = await mysqldbpool.query(strSQL,values);
    return rows as any[];        
}

export const getGenbaListDB = async(
    comp_id : string
    ,cus_id : string
    ,page: number = 0
    ,pageSize: number = 100
) =>{
    let strSQL = `select
    lpad(ca.kanrino,4,'0') kanrino
    ,date_format(ca.closingdate,'%Y/%m/%d') closingdate
    ,ca.est_price
    ,date_format(ca.salesdate,'%Y/%m/%d') salesdate
    ,ca.salesprice
    ,((coalesce(ca.salesprice,0) - coalesce(ca.total_collected_amount,0)) * -1) zandaka
    ,date_format(ca.canceldate,'%Y/%m/%d') canceldate
    ,ca.cancelreason
    ,(select
        group_concat(ag.agariserv_desc)
        from
        customermaster_prodserv cp
        left join agariservices ag on ag.agariserv_id = cp.prodservid
        where
        cus_id = ca.cus_id
        and kanrino = ca.kanrino
    ) koujinaiyou 
    from
    customermaster_agarimaster ca
    where
    ca.comp_id = ?
    and ca.cus_id = ?
    order by kanrino
    `;
    const values: any[] = [];
    values.push(comp_id,cus_id);
    const strCount = `select count(*) as total from (${strSQL}) as t`;
    const [rowsCount] = await mysqldbpool.query(strCount, values);
    strSQL += ` LIMIT ? OFFSET ?`;
    values.push(pageSize, page * pageSize);   
    const [rows] = await mysqldbpool.query(strSQL,values);
    return {rows: rows, rowsCount: rowsCount} as any;  
}

export const getCusInfoDB = async(
    comp_id : string
    ,cus_id : string
) =>{
    const strSQL = `select
    c.br_id
    ,c.cus_lname
    ,c.cus_fname
    ,c.cus_lname_kana
    ,c.cus_fname_kana
    ,c.zipcode
    ,c.prefcitytown
    ,c.banchi
    ,c.contactno
    ,c.faxno
    ,c.email
    ,c.tanto_id
    ,date_format(c.birthdate,'%Y/%m/%d') birthdate
    ,u.user_name
    ,coalesce(c.deleted_datetime,'0000-00-00 00:00:00') deleted_datetime
    from
    customermaster c
    left join usermaster u on u.user_id = c.tanto_id and u.comp_id = c.comp_id
    where
    c.comp_id = ?
    and c.cus_id = ?
     `;
    const values = [comp_id ,cus_id];
    const [rows] = await mysqldbpool.query(strSQL,values);
    return rows as any[];       
}

export const saveCustomertoDB = async(
    comp_id : string
    ,cus_id : string
    ,cus_lname : string
    ,cus_fname : string
    ,cus_lname_kana : string
    ,cus_fname_kana : string
    ,zipcode : string
    ,prefcitytown : string
    ,banchi : string
    ,contactno : string
    ,faxno : string
    ,email : string    
    ,br_id : string
    ,lat : string
    ,lng: string
    ,birthdate : string
    ,tanto_id : string
    ,user_id: string
) =>{
    if(cus_id.trim()=="0"){        
        cus_id = await generateCusID(comp_id);
    } 
    const strSQL = `insert into customermaster
    set
    comp_id = ?
    ,cus_id = ?
    ,br_id = ?
    ,cus_lname = ?
    ,cus_fname = ?
    ,cus_lname_kana = ?
    ,cus_fname_kana = ?
    ,zipcode = ?
    ,prefcitytown = ?
    ,banchi = ?
    ,contactno = ?
    ,faxno = ?
    ,email = ?
    ,lat = ?
    ,lng = ?
    ,birthdate = ?
    ,tanto_id = ?
    ,added_by = ?
    ,added_datetime = NOW()
    on duplicate key update
    modified_by = ?
    ,modified_datetime = NOW()
    ,br_id = ?
    ,cus_lname = ?
    ,cus_fname = ?
    ,cus_lname_kana = ?
    ,cus_fname_kana = ?
    ,zipcode = ?
    ,prefcitytown = ?
    ,banchi = ?
    ,contactno = ?
    ,faxno = ?
    ,email = ?
    ,lat = ?
    ,lng = ?    
    ,birthdate = ?
    ,tanto_id = ?
    `;    
    let compsave = 1;
    const values = [
        comp_id
        ,cus_id
        ,br_id
        ,cus_lname
        ,cus_fname
        ,cus_lname_kana
        ,cus_fname_kana
        ,zipcode
        ,prefcitytown
        ,banchi
        ,contactno
        ,faxno
        ,email
        ,lat
        ,lng        
        ,birthdate
        ,tanto_id
        ,user_id
        ,user_id
        ,br_id
        ,cus_lname
        ,cus_fname
        ,cus_lname_kana
        ,cus_fname_kana
        ,zipcode
        ,prefcitytown
        ,banchi
        ,contactno
        ,faxno
        ,email
        ,lat
        ,lng        
        ,birthdate
        ,tanto_id
    ];
        
    try {        
        await mysqldbpool.execute(strSQL, values);            
    } catch{
        compsave = 0;
    }    
    
    return [compsave, cus_id];
}

export const getCustomerListDB = async(
    comp_id : string
    ,br_id : string
    ,searchkey : string
    ,isactive : number
    ,page: number = 0
    ,pageSize: number = 100    
) =>{       
    let strSQL = `
                  select
                   c.cus_id
                   ,br.br_name
                   ,concat(c.cus_lname,' ',c.cus_fname) cus_name
                   ,concat(c.cus_lname_kana,' ',c.cus_fname_kana) cus_name_kana
                   ,concat(c.prefcitytown,c.banchi) address                   
                   ,ca.kanrino                   
                   ,if(coalesce(ca.salesdate,'0000-00-00') <> '0000-00-00' and coalesce(ca.canceldate,'0000-00-00')='0000-00-00',1,0) salescnt
                   ,if(coalesce(ca.canceldate,'0000-00-00')<>'0000-00-00',1,0) cancelcnt    
                   ,if(coalesce(ca.canceldate,'0000-00-00')='0000-00-00',((coalesce(ca.salesprice,0) - coalesce(ca.total_collected_amount,0)) * -1),0) zandaka
                   ,c.added_datetime
                   ,c.br_id
                   ,c.contactno
                   from
                   customermaster c
                   left join customermaster_agarimaster ca on ca.cus_id = c.cus_id 
                   left join usermaster u on u.user_id = c.tanto_id
                   left join branchmaster br on br.br_id = c.br_id
                   where
                   1=1    
                   and c.comp_id = ?                                                          
    `;
    const values: any[] = [];
    values.push(comp_id);
    
    if(br_id!="0"){
        strSQL += `
        and c.br_id = ?
        `;
        values.push(br_id);    
    }    
    
    if(isactive==0){
        strSQL += `
         and coalesce(deleted_datetime,'0000-00-00 00:00:00') <> '0000-00-00 00:00:00'
        `;
    } else {
        strSQL += `
         and coalesce(deleted_datetime,'0000-00-00 00:00:00') = '0000-00-00 00:00:00'
        `;        
    } 
    if(typeof searchkey !== "string"){
        searchkey = "";
    }
    
    if(searchkey.trim()){
        const words = searchkey.trim().split(/\s+/); // Split by multiple spaces
        const havingConditions = words.map(() => `
            (
                CONVERT(br_name USING utf8) COLLATE utf8_unicode_ci LIKE ?
                OR CONVERT(cus_name USING utf8) COLLATE utf8_unicode_ci LIKE ?
                OR CONVERT(cus_name_kana USING utf8) COLLATE utf8_unicode_ci LIKE ?
                OR CONVERT(address USING utf8) COLLATE utf8_unicode_ci LIKE ?
                OR CONVERT(kanrino USING utf8) COLLATE utf8_unicode_ci LIKE ?
                OR CONVERT(salescnt USING utf8) COLLATE utf8_unicode_ci LIKE ?
                OR CONVERT(cancelcnt USING utf8) COLLATE utf8_unicode_ci LIKE ?
                OR CONVERT(zandaka USING utf8) COLLATE utf8_unicode_ci LIKE ?
            )
        `).join(' AND ');
        strSQL += `
        having
        ${havingConditions}
        `;
        // Add search parameters for each word across all fields
        words.forEach(word => {
            values.push(`%${word}%`, `%${word}%`,`%${word}%`, `%${word}%`,`%${word}%`, `%${word}%`,`%${word}%`, `%${word}%`);
        });
    }      
    
    let finalSQL = `select
                alldata.cus_id
                ,alldata.br_id                
                ,alldata.br_name                
                ,count(alldata.kanrino) shoudancnt
                ,sum(alldata.salescnt) salescnt                   
                ,sum(alldata.cancelcnt) cancelcnt    
                ,alldata.cus_name                
                ,alldata.cus_name_kana                
                ,alldata.address             
                ,alldata.contactno   
                ,sum(alldata.zandaka) zandaka
                from
                (
                    ${strSQL}
                ) alldata
                where
                1=1
                group by alldata.cus_id
                order by alldata.added_datetime desc, alldata.cus_id     
                `;
            
    const strCount = `select count(*) as total from (${finalSQL}) as t`;
    const [rowsCount] = await mysqldbpool.query(strCount, values);
    // Add pagination    
    finalSQL += ` LIMIT ? OFFSET ?`;
    values.push(pageSize, page * pageSize);   
    const [rows] = await mysqldbpool.query(finalSQL, values);    
    return {rows: rows, rowsCount: rowsCount} as any;        
}

export const generateCusID = async(
    comp_id : string
) =>{
    const cusSQL = `select
    concat(date_format(CURDATE(),'%y%m%d'),LPAD(finaldata.cus_cnt,4,'0')) cus_id
    from
    (
    select
    (count(cus_id)+1) cus_cnt
    from
    customermaster
    where
    comp_id = ?
    ) finaldata
    where
    1=1
   `;
   const [rows]: any = await mysqldbpool.query(cusSQL, [comp_id]);
   return rows[0].cus_id;
}


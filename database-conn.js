require('dotenv').config

const url=require('fs')



const chat_db_conn=url.readFileSync(process.env.chat_db)
const chat=JSON.parse(chat_db_conn)



module.exports={url,chat}








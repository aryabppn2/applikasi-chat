const mongoose=require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/kandilo-app").then(()=>{
  console.log('mongosse succesfully')
}).catch((err)=>{
 console.log(err)
})


const UserSchema=new mongoose.Schema({
     username:String,
     email:String,
     password:String,
     passwordHash:String,
     style:{
        color:String,
        bgcolor:String
     },
     description:String,
     friends:[{
      email:String,
      username:String,
      status:String
     }]

},{collection:"admin_db"})

const User=mongoose.model('User',UserSchema)



module.exports=User;
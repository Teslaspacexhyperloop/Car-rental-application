
const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const passportLocalMongoose=require("passport-local-mongoose")

const userSchema=new Schema({
    email:{
        type: String,
        required:true,
    },
});

userSchema.plugin(passportLocalMongoose);//  ye plugin karte hi username, hashing,salting and hashpassword automatically implement kar deta hai
module.exports=mongoose.model("User",userSchema);

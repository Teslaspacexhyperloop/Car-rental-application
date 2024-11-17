if(process.env.NODE_ENV !="production"){
    require("dotenv").config()
}

const express=require("express");
const app=express();
const mongoose=require("mongoose");

const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const { nextTick } = require("process");
const ExpressError=require("./utils/ExpressError.js");
const session=require("express-session");
const MongoStore = require('connect-mongo');
const flash=require("connect-flash");
const passport=require("passport")
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");

const listingRouter=require(".//routes/listing.js");

const userRouter=require("./routes/user.js");
const Listing = require("./models/listing.js");


// const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust";
const dburl=process.env.ATLASDB_URL;
main().then(()=>{
    console.log("Server is connected to DB");
}).catch((err)=>{
    console.log(err);
});

async function main(){
    await mongoose.connect(dburl);

}

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));//request k andar ka data parse ho paye
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const store=MongoStore.create({
    mongoUrl: dburl,
    crypto: {
        secret: process.env.SECRET,  
    },
    touchAfter:24*3600

})

const sessionOptions={
    store, // ab hamari session related info atlas par save ho rahi hai
    secret: process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie: {
        expires: Date.now()+7*24*60*60*1000,//miliseconds
        maxAge: 7*24*60*60*1000,
        httpOnly: true,
    },
};

store.on("error",()=>{
    console.log("Eroor in mongo session store")
})

// app.get("/",(req,res)=>{
//     res.send("Hi, I am Mohammad Sibtain Raza");
// })



app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());//session middlleware k baad bcz it uses session. 
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());//session k andar user data store 
passport.deserializeUser(User.deserializeUser());//de-allocate 

app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    next();
});

// app.get("/demouser", async(req,res)=>{
//     let fakeUser=new User({
//         email: "student@gmail.com",
//         username: "delta-student",
//     });

//     let registeredUser= await User.register(fakeUser, "password123");
//     res.send(registeredUser);
// })

app.use("/listings",listingRouter);
app.use("/",userRouter);
// app.post("/namelistings",async()=>{
//     let {name}=req.body;
//     let allListings=await Listing.find({title:name});
//     res.render("/listings/index.js");
// })
// app.get("/testListing",async (req,res)=>{
//     let newlisting=new Listing({
//         title:"My new Villa",
//         description:"It is situated near a pond",
//         price:5000,
//         location:"Lucknow",
//         country:"India"
//     });
//     await newlisting.save();
//     res.send("successfull saved");
// })



//jab uper kisi route se match nhi hoga
app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page Not Found"));
})

app.use((err,req,res,next)=>{
    let {statusCode=500,message="Some Error Occured"}=err;
    res.status(statusCode).render("error.ejs",{message});
})

app.listen(8080,()=>{
    console.log("server is listening on port 8080");
});
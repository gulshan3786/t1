import express from "express";
import db from './db.mjs';
import router from './route2.mjs';
const app=express();
const port=3000;
app.set('view engine','ejs');

db.connect((err)=>{
    if(err){
        console.error("unable to connect",err);

    }else{
        console.log('connected to the database');
        app.use("/",router);
       
        
        app.listen(port,(req,res)=>{
            console.log(`server is listening on port ${port}`)
           
        })

    }
})

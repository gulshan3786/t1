import mysql from "mysql2";
const db=mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"root",
    database:"db_26"
});
db.connect((err)=>{
    if(err){
        console.error("database connection failed",err);
    }
    else{
        console.log("databse successfully connected");
    }
});
export default db;


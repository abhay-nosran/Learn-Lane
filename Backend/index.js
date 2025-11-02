require('dotenv').config()
const express = require("express") ;

const PORT = process.env.PORT ;

const app = express() ;

app.post("/createTopic",) ;

app.listen(PORT,()=>{
    console.log(`Learn Lane is listening on ${PORT}`) ;
})
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var cors = require('cors')

app.use(bodyParser.json())
// app.use(bodyParser.urlencoded({ extended: true }))
// Include local database serve
 mongoose.connect('mongodb+srv://testDataBase:jWom1tR8a00P4OJe@cluster0.65q1h.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true});
var db = mongoose.connection;
app.use(cors())
//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.on('connected',()=>{
     console.log("connected with DB")
})   

app.use('/api',require('./api/routing')(express))
app.listen('4000',function(){
    console.log("our server run on 4000")
})
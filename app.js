require('dotenv/config');
const express = require('express')
const app = express()
const bodyParser = require("body-parser")
var fs = require('fs');
var path = require('path');
var mongoose = require('mongoose')
app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json())

mongoose.connect(process.env.MONGO_URL,
    { useNewUrlParser: true, useUnifiedTopology: true }, err => {
        console.log('connected to DB')
    });

var multer = require('multer');
 
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
    }
});
 
var upload = multer({ storage: storage });

var imgModel = require('./model');

app.get("/",function(req,res){
    res.render("home.ejs")
})

app.get("/result",function(req,res){
    
    imgModel.find({},function(err,items){
        if(err)
        {
            res.send("Error 404");
            return;
        }
        else
        {           
            res.render("result",{items: items});
        }
    })

})

app.post("/result",function(req,res){
    const searchKeywords = (req.body.searchKeyword).toLowerCase();

    if(searchKeywords.length == 0){
        res.redirect("/");
        return;
    }

    imgModel.find({tags: searchKeywords},function(err,items){
        if(err)
        {
            res.send("Error 404");
            return;
        }
        else
        {           
            res.render("result",{items: items});
        }
    })
})

app.post("/upload",upload.single('image'),function(req,res,next){

    const tags = req.body.tags;
    var array = tags.match(/[^\s]+/g);
    
    for(var x=0;x<array.length;x++) {
        array[x] = array[x].toLowerCase();
    }
    

    var obj = {
        tags: array,
        img: {
            data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
            contentType: 'image/png'
        }        
    }

    imgModel.create(obj, (err, item) => {
        if (err) {
            console.log(err);
        }
        else {
            // item.save();            
            res.redirect('/');
        }
    });



})

var port = process.env.PORT;
if(port == null || port ==""){
    port = 3000;
}
app.listen(port,function(req,res){
    console.log("Server started")
})
require('dotenv/config');
const express = require('express')
const app = express()
const bodyParser = require("body-parser")
const getEnv = require('./evn-url')
var fs = require('fs');
var path = require('path');
var mongoose = require('mongoose')
var redis = require('redis');
var session = require('express-session');
var redisStore = require('connect-redis')(session);
const passport = require('passport');
const cookieSession = require('cookie-session')
var favicon = require('serve-favicon');
require('./passport-setup');

app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json())

app.use('/images/favicon.ico', express.static('public'));


app.use(cookieSession({
    
    name: 'tuto-session',
    keys: ['key1', 'key2'],
    
  }))

  const isLoggedIn = (req, res, next) => {
    if (req.user) {
        next();
    } else {
        res.sendStatus(401);
    }
}

app.use(passport.initialize());
app.use(passport.session());




mongoose.connect(getEnv.DB(),
    { useNewUrlParser: true, useUnifiedTopology: true }, err => {
        console.log('connected to DB')
    });

var multer = require('multer');

const randomKeyWordList = ["akshay kumar" , "bezzati", "paisa", "doge" , "Mirzapur" , "jal"];
 
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
    }
});
 
var upload = multer({ storage: storage });

var imgModel = require('./model-img');
const { resolve } = require('path');
const { reject } = require('bluebird');

var userModel = require('./model-user');



// user.save(function(err,result){
//     if(!err)
//     {
//         console.log(result._id);
//     }
// });

app.get("/",function(req,res){

    var logged_in = "false";

    if(req.session.isLoggedIn){
        logged_in = "true";
    }

    res.render("home.ejs",{ logged_in: logged_in ,
                            profileName: req.session.name,
                            profileEmail: req.session.email,
                            imgSource: req.session.img,
                            totalLikes: 0,
                           randomKeyWord: randomKeyWordList[Math.floor(Math.random()*randomKeyWordList.length)]})
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
            if(!req.session.isLoggedIn)
            {
                var liked = [];
                for(var x=0;x<items.length;x++){
                    liked.push(0);
                }
                res.render("result",{items:items,liked: liked})
                return;
            }
            userModel.find({email: req.session.email},function(err,result){                
                if(!err){
                    var liked = []
                    // console.log(items);
                    for(var x=0;x<items.length;x++){                        
                        if(result[0].liked.includes(items[x]._id)){
                            liked.push(1);
                        }
                        else
                        {
                            liked.push(0);
                        }
                    }
                    // console.log(liked);
                    res.render("result",{items:items,liked: liked})
                }
                
            })
        }
    })

})

app.post("/result",function(req,res){
    const searchKeywords = (req.body.searchKeyword).toLowerCase();
    var array = searchKeywords.match(/[^\s]+/g);

    var list=[]

    if(array == null || array.length == 0){
        res.redirect("/");
        return;
    }

    imgModel.find({},function(err,result){
        if(!err){
            for(var x = 0;x<result.length;x++){                
                for(var y=0;y<array.length;y++){                    
                    if(result[x].tags!=null &&  result[x].tags.includes(array[y])) {                        
                        list = list.concat(result[x])
                        break;
                    }
                }
            }   
            if(!req.session.isLoggedIn)
            {
                var liked = [];
                for(var x=0;x<list.length;x++){
                    liked.push(0);
                }
                res.render("result",{items:list,liked: liked})
                return;
            } 
            userModel.find({email: req.session.email},function(err,result){
                if(!err){
                    var liked = []
                    for(var x=0;x<list.length;x++){
                        if(result[0].liked.includes(list[x]._id)){
                            liked.push(1);
                        }
                        else
                        {
                            liked.push(0);
                        }
                    }
                    res.render("result",{items:list,liked: liked})
                }
                
            })
            
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


app.post('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/google/callback', passport.authenticate('google', { failureRedirect: '/failed' }),
  function(req, res) {
    // Successful authentication, redirect home.
    req.session.isLoggedIn = 1;
    req.session.email = req.user.email;
    req.session.name  = req.user.displayName;
    req.session.img = req.user.picture;



    userModel.find({email: req.session.email},function(err,result){
        if(!err){
            if(result.length == 0)
            {
                var n = new userModel({
                    email: req.session.email,
                    liked:[]
                });
                n.save(function(err,result){
                    if(!err)
                    {
                        // console.log(result);
                        res.redirect('/');
                    }
                });
                
            }
            else
            {
                res.redirect('/');
            }
        }
    })
    
    
  }
);

app.post('/logout', (req, res) => {
    
    req.session = null;
    req.logout();
    res.redirect('/');
})


app.post("/handleLike",function(req, res){
    const x = req.body.x;
    var id = req.body.id;
    // console.log(x);
    id = mongoose.Types.ObjectId(id);
    // console.log(id);
    // console.log(typeof(id));

    if(!req.session.isLoggedIn){

        res.end("error");
        return;

    }


    if(x=="like") {

        var query = {email: req.session.email},
        update = { $push: {liked: id} },
        options = { upsert: true, new: true, setDefaultsOnInsert: true };

        // Find the document
        userModel.findOneAndUpdate(query, update, options, function(error, result) {
        if (error) return;
        // do something with the document
        // console.log(result);
        return res.end('done')
        }); 

    }
    else
    {
        userModel.findOneAndUpdate({email: req.session.email} , {$pullAll: {liked: [id]}},function(err,result){
            if(!err) {
                // console.log(result)
                return res.end('done')

            }
        })

    }

    

    
})

var port = process.env.PORT;
if(port == null || port ==""){
    port = 3000;
}
app.listen(port,function(req,res){
    console.log("Server started")
})


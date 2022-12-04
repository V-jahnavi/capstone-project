const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore} = require('firebase-admin/firestore');
const {LocalStorage} = require('node-localstorage');
const math=require("mathjs");
var serviceAccount = require("./e2.json");
var localStorage=new LocalStorage('./scratch')
initializeApp({
  credential: cert(serviceAccount)
});
const db = getFirestore();
var express = require('express')  
var app = express()  

app.set('view engine','ejs');
var items;
app.get('/',function(req,res){
    res.render("new");
});
app.get('/register', function (req, res) {  
    res.render("register")
})  
app.get('/signup',function(req,res){
   res.render("signup")
})       
app.get('/signupSubmit',function(req,res){
    
    db.collection('credentials').add({
       
        "username":req.query.username,
        "password":req.query.password,
        "repeatPassword":req.query.repeatPassword
    }).then(()=>{
        res.render("login")
        
    });
    db.collection("credentials").get().then(function(docs){
        docs.forEach((doc)=>{
            console.log(doc.id,'=>',doc.data());
    });
})

});

app.get('/login',function(req,res){
    res.render("login")
})
app.get('/loginSubmit',function(req,res){
    db.collection("credentials").get().then(function(docs){
    const username = req.query.username;
    const password = req.query.password;
    db.collection("credentials")
    .where("username","==",username)
    .where("password","==",password)
    .get()
    .then((docs) => {
        if(docs.size > 0){
            res.render("homepage");
        }
        else{
            res.render("login");
        }
        });
    })

});
app.get('/cartSubmit', function (req, res) {   
        res.render("cart")
    })  

app.get('/homepage', function (req, res) {
	
		res.render("homepage");
})  

app.get('/homepage/:val', function(req, res) { 
	
		let category = req.params.val
		db.collection("menu")
		.where("itemcat", "==", category)
		.get().then(function(docs) {
			const categories = require("./categories.json")
			res.render("menu", {products: docs, menuTitle: categories[category]})
    	});
	
})
app.get('/removeItem/:id', function(req, res) {
	db.collection("cart").doc(req.params.id).delete().then((doc)=> {res.redirect('/cart')});
});
// checkout logic
app.get('/checkout', function(req, res) {
	db.collection("cart").where("user", "==", localStorage.getItem("username")).get().then((docs)=> {
		docs.forEach((doc)=> {
			doc.ref.delete();
		});
		res.send("Thank you for ordering with us! \n Please pay bill amount in Cash");
	});
});
app.get('/menu', function(req, res) { 
db.collection("menu")
        .where("itemname".trim(), "not-in", ["", " "])
        .get().then(function(docs) {
            res.render("menu", {products: docs})
        }); 
    })
app.get('/newmenu', ((req, res) => {
                res.render("newmenu")
            
                    }));
app.get('/cart',((req,res)=>{
db.collection("cart")
        .where("cartid", "==", localStorage.getItem("username"))
        .get()
        .then((docs) => {
            let totalcost = 0;
            docs.forEach((doc) => {
                totalcost+=parseInt( doc.data().itemcost);
            })
            
            res.render("cart", {cartItems: docs, total: totalcost});
        });
    }));
app.get('/addToCart',function(req,res){
    const loggedInUser = localStorage.getItem("username");
    
    db.collection('cart').add({
        cartid: loggedInUser,
        itemid: req.query.addToCartBtn,
        itemname: req.query.itemname,
        itemcost: req.query.itemcost
    }).then(()=>{
        res.redirect('/cart')
    });
   
});
app.get('/addMenuItems', function(req, res) {
    let itemId;
    db.collection("idgenerator").doc('idgen').get().then((doc) => {
        db.collection('menu').add({
            itemid: doc.data().generatedid,
            itemname: req.query.itemname,
            itemcat: req.query.itemcat,
            itemcost: req.query.itemcost,
            imageurl: req.query.imageurl
        }).then (() => {res.redirect('/newmenu');})
        db.collection("idgenerator").doc('idgen').update({generatedid: doc.data().generatedid+1});
    });
    
})
app.get('/about',function(req,res){
    res.render("about")
})
app.get('/contactus',function(req,res){
    res.render("contactus")
})
app.get('/thankyou',function(req,res){
    res.render("thankyou")
})
app.listen(3000, function () {  
console.log('Example app listening on port 3000!')  
})



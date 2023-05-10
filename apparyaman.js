const express=require("express");
const bodyParser=require("body-parser");const path=require("path");
const app=express();

app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,'assets')));
app.get("/login",function(req,res){
    res.render("login");
});
app.listen(3000,function(){
    console.log("Server started on 3000");


})
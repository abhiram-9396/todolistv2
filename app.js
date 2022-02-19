//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const _ = require("lodash");

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Abhiram-17:Abhiram-atlas@cluster0.suhpf.mongodb.net/todolistDB" , {useNewUrlParser : true});

const Itemschema = new mongoose.Schema({
  name : {
    type: String,
    required: [true , "Please check ur data entry.. name field is not specified!"]
  }
});

const Item = mongoose.model("Item" , Itemschema);

const item1 = new Item({
  name : "Welcome to Todo list app"
});

const item2 = new Item({
  name : "Click + button to add the item"
});

const item3 = new Item({
  name : "<--- click this to delete the item"
});

const defaultitems = [item1,item2,item3];

const Listschema = new mongoose.Schema({
  name : {
    type: String
  },
  items : [Itemschema]
});

const List = mongoose.model("List",Listschema);

app.get("/", function(req, res) {

  Item.find({},function(err,founditems){

    if(founditems.length===0) //if there are no items to be displayed then we have to display the below items as an intro.
    {
        Item.insertMany(defaultitems,function(err){
        if(err)
        {
          console.log(err);
        }
        else{
          console.log("successfully inserted the intro items!!");
        }
      });
      res.redirect("/");
    }
    else
    {
      res.render("list", {listTitle: "Today", newListItems: founditems});
    }
  });
});

app.get("/:customlistname",function(req,res){
  const customlistname = _.capitalize(req.params.customlistname); //this command stores the name of our custom list to customlistname.

  List.findOne({name: customlistname} , function(err , foundlist){
    if(!err)
    {
      if(!foundlist)
      {
        //Create a new list
        // console.log("Doesnt exist!");
        const list = new List({
          name : customlistname,
          items : defaultitems
        });
      
        list.save();
        res.redirect("/"+ customlistname)
      }
      else
      {
        //Show existing list
        // console.log("Exists!!");
        res.render("list", {listTitle: foundlist.name, newListItems: foundlist.items})
        
      }
    }
  });

  

});


//below code is to insert a new item into  the todolist
app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName  = req.body.list;

  const item = new Item({
    name : itemName
  });

  if(listName === "Today")
  {
    item.save();
    res.redirect("/");
  }
  else
  {
    List.findOne({name : listName} , function(err , foundlist){
      foundlist.items.push(item);
      foundlist.save();
      res.redirect("/" + listName);
    });
  }

  

});


//below code is to delete a new item into  the todolist
app.post("/delete", function(req, res){
  // console.log(req.body.checkbox);
  const checkeditemid = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today")
  {
    Item.findByIdAndRemove(checkeditemid, function(err){
      if(!err){
        console.log("successfully deleted checked!");
        res.redirect("/");
      }
    });
  }
  else
  {
    List.findOneAndUpdate({name : listName}, {$pull : {items : {_id : checkeditemid}}} , function(err,foundlist){
      if(!err)
      {
        res.redirect("/" + listName);
      }
    });
  }

  
});



app.listen(3000, function() {
  console.log("Server started on port 3000");
});

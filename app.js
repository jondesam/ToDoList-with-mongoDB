//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
// const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {
  useNewUrlParser: true
})

const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemsSchema);

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

const milk = new Item({
  name: "buy a milk"
});
const orange = new Item({
  name: "buy a orange"
});
const apple = new Item({
  name: "buy a apple"
});
const moreApple = new Item({
  name: "buy more apple"
});

const defaultItems = [milk, orange, apple, moreApple];

Item.deleteOne({_id:"5d6458fbb0ff7d817f678fd6"}, function(err){
  console.log("item deleted")
});

// Item.insertMany(defaultItems, function(err) {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log("successfully saved");
//   }
// });
//
// Item.remove(function(err) {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log("successfully removed");
//   }
// });


app.get("/", function(req, res) {

  // const day = date.getDate();

  Item.find(function(err , items){

    if (err) {
      console.log(err);

    } else if (items.length === 0) {

      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("successfully saved");
        }
      });
      res.redirect("/")
  } else {
    res.render("list.ejs", {
      listTitle: "Today",
      newListItems: items
    });
  }
  });
});

app.post("/", function(req, res) {
  //const item = req.body.newItem;

  const newItemFromInput = new Item({
    name: req.body.newItem
  })

  if (req.body.list === "Work") {
    workItems.push(item);
    res.redirect("/work");

  } else {
    newItemFromInput.save();
    res.redirect("/");

    //replaced by the code above

    // defaultItems.push(newItemFromInput);
    //
    // Item.remove(function(err) {
    //   if (err) {
    //     console.log(err);
    //   } else {
    //     console.log("successfully removed");
    //   }
    // });
    //
    // Item.insertMany(defaultItems, function(err){
    //   if (err){
    //     console.log(err);
    //   }else {
    //       res.redirect("/");
    //   }
    // })

  }
});

app.get("/work", function(req, res) {
  res.render("list", {
    listTitle: "Work List",
    newListItems: workItems
  });
});

app.get("/about", function(req, res) {
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});

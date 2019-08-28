//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");


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

//create the model
const ItemModel = mongoose.model("Item", itemsSchema);

const milk = new ItemModel({
  name: "buy a milk"
});
const orange = new ItemModel({
  name: "buy a orange"
});
const apple = new ItemModel({
  name: "buy a apple"
});
const moreApple = new ItemModel({
  name: "buy more apple"
});

const defaultItems = [milk, orange, apple, moreApple];

///root page
app.get("/", function(req, res) {

  ItemModel.find({}, function(err, items) {

    if (err) {
      console.log(err);

    } else if (items.length === 0) {

      ItemModel.insertMany(defaultItems, function(err) {
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


/// custom pages ///
const listSchema = new mongoose.Schema({
  titleName: String,
  items: [itemsSchema]
})

//create the model
const newCustomListModel = mongoose.model("List", listSchema)

app.get("/:customListTitle", function(req, res) {

  let customListTitle = _.capitalize(req.params.customListTitle);

  newCustomListModel.findOne({
    titleName: customListTitle
  }, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        //Create a new list if there is no same name page

        const newList = new newCustomListModel({
          titleName: customListTitle,
          items: defaultItems
        });

        newList.save();

        res.redirect("/" + customListTitle);

      } else {

        //Show an existing list if there is same name page

        res.render("list.ejs", {
          listTitle: foundList.titleName,
          newListItems: foundList.items
        })
      }
    }
  })
});



app.post("/", function(req, res) {
  //const item = req.body.newItem;

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const newItemFromInput = new ItemModel({
    name: itemName
  });

  if (listName === "Today") {

    newItemFromInput.save();
    res.redirect("/");

  } else {
    newCustomListModel.findOne({
      titleName: listName
    }, function(err, foundList) {
      if (err) {
        console.log(err);
      } else {
        foundList.items.push(newItemFromInput);
        foundList.save();
        res.redirect("/" + listName);

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

    })
  }


});

app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    ItemModel.findByIdAndRemove(checkedItemId, function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log("ticked item deleted");
        res.redirect("/")
      }
    });
  } else {
    newCustomListModel.findOneAndUpdate({
      titleName: listName
    }, {
      $pull: {
        items: {
          _id: checkedItemId
        }
      }
    }, function(err, foundList) {
      if (!err) {
        res.redirect("/" + listName);
      }
    });
  }
});



app.get("/work", function(req, res) {
  res.render("list.ejs", {
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

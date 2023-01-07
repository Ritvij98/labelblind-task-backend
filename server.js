var express = require("express");
var cheerio = require("cheerio");
const Nightmare = require("nightmare");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const FoodItem = require("./models/foodItem");
dotenv.config();
var PORT = process.env.PORT || 3000;
const nightmare = Nightmare();
const url = "https://www.jiomart.com/c/groceries/2";
let categories;
var app = express();

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("DBConnection Successful!");
  })
  .catch((err) => {
    console.log(err);
  });

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.use(express.static(path.join(__dirname, 'build')));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});


app.get("/categories", function (req, res) {
  nightmare
    .goto(url)
    .wait("body")
    .evaluate(() => document.querySelector("body").innerHTML)
    .then(function (response) {
      const $ = cheerio.load(response);
      categories = [];
      $(".inner li").each(function (i, elem) {
        const category = $(elem).find("a").text();
        const categoryLink = $(elem).find("a").attr("href");
        categories.push({
          category: category,
          categoryLink: categoryLink,
        });
      });
      res.status(200).send({ categories: categories });
    })
    .catch(function (err) {
      res.status(500).send(err.message);
    });
});

app.get("/scrape/:category", function (req, res) {
  const selectedCategory = categories.filter(c=> {return c.category===req.params.category})  
  console.log(selectedCategory)
  nightmare
    .goto("https://www.jiomart.com"+selectedCategory[0].categoryLink)
    .wait("body")
    .evaluate(() => document.querySelector("body").innerHTML)
    .then(function (response) {
      const $ = cheerio.load(response);
      let foodItemsArray = [];
       $("div.cat-item").each(function (i, elem) {
        const name = $(elem).find(".clsgetname").text();
        const price = $(elem).find("#final_price").text().split(" ")[1];
        //    const link = foodItem.find('a.a-link-normal').attr("href")
        //    const size = foodItem.find('a.a-link-normal').attr("href")
        //    const ingredients = foodItem.find('a.a-link-normal').attr("href")
        //    const price = foodItem.find('a.a-link-normal').attr("href")
        //    const nutritionInfo = foodItem.find('a.a-link-normal').attr("href")
        //    const description = foodItem.find('a.a-link-normal').attr("href")
        //    const imgUrls = foodItem.find('a.a-link-normal').attr("href")
        //    const veg = foodItem.find('a.a-link-normal').attr("href")
        const foodItem = {
          name:name,
          price:price
        };
        foodItemsArray.push(foodItem);
      });
      console.log(foodItemsArray);
      let savedItemsArray = [];
      foodItemsArray.forEach(async function (eachItem) {
        const newItem = new FoodItem(eachItem);
        const savedItem = await newItem.save();
        savedItemsArray.push(savedItem);
      });
      res.statusCode(200).send(savedItemsArray); 
    })
    .catch(function (err) {
      res.json(err);
    });
});

app.listen(PORT, function () {
  console.log("App listening on port " + PORT);
});

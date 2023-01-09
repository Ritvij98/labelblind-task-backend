var express = require("express");
var cheerio = require("cheerio");
const Nightmare = require("nightmare");
const mongoose = require("mongoose");
const path = require("path");
const axios = require("axios");
const dotenv = require("dotenv");
const cors = require("cors");
const FoodItem = require("./models/foodItem");
dotenv.config();
var PORT = process.env.PORT || 3000;
const nightmare = Nightmare({
  show: true,
  pollInterval: 5, //in ms
});
const url =
  "https://www.flipkart.com/grocery/staples/ghee-oils/pr?sid=73z,bpe,4wu&marketplace=GROCERY";
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

// app.use(express.static(path.join(__dirname, 'client/build')));

// app.get('/', function (req, res) {
//   res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
// });

// app.get("/categories", function (req, res) {
//   nightmare
//     .goto(url)
//     .click(".w8stwo")
//     .wait("#r1-0 a.result__a")
//     .evaluate(() => document.querySelector("#r1-0 a.result__a").href)
//     .then(function (response) {
//       const $ = cheerio.load(response);
//       categories = [];
//       $(".inner li").each(function (i, elem) {
//         const category = $(elem).find("a").text();
//         const categoryLink = $(elem).find("a").attr("href");
//         categories.push({
//           category: category,
//           categoryLink: categoryLink,
//         });
//       });
//       res.status(200).send({ categories: categories });
//     })
//     .catch(function (err) {
//       res.status(500).send(err.message);
//     });
// });

// app.get("/scrape/:category", function (req, res) {
//   const selectedCategory = categories.filter(c=> {return c.category===req.params.category})
//   console.log(selectedCategory)
//   nightmare
//     .goto("https://www.jiomart.com"+selectedCategory[0].categoryLink)
//     .wait("body")
//     .evaluate(() => document.querySelector("body").innerHTML)
//     .then(function (response) {
//       const $ = cheerio.load(response);
//       let foodItemsArray = [];
//        $("div.cat-item").each(function (i, elem) {
//         const name = $(elem).find(".clsgetname").text();
//         const price = $(elem).find("#final_price").text().split(" ")[1];
//         //    const link = foodItem.find('a.a-link-normal').attr("href")
//         //    const size = foodItem.find('a.a-link-normal').attr("href")
//         //    const ingredients = foodItem.find('a.a-link-normal').attr("href")
//         //    const price = foodItem.find('a.a-link-normal').attr("href")
//         //    const nutritionInfo = foodItem.find('a.a-link-normal').attr("href")
//         //    const description = foodItem.find('a.a-link-normal').attr("href")
//         //    const imgUrls = foodItem.find('a.a-link-normal').attr("href")
//         //    const veg = foodItem.find('a.a-link-normal').attr("href")
//         const foodItem = {
//           name:name,
//           price:price
//         };
//         foodItemsArray.push(foodItem);
//       });
//       console.log(foodItemsArray);
//       let savedItemsArray = [];
//       foodItemsArray.forEach(async function (eachItem) {
//         const newItem = new FoodItem(eachItem);
//         const savedItem = await newItem.save();
//         savedItemsArray.push(savedItem);
//       });
//       res.statusCode(200).send(savedItemsArray);
//     })
//     .catch(function (err) {
//       res.json(err);
//     });
// });
app.get("/scrape/:searchInput", function (req, res) {
  axios
    .get(`https://www.amazon.in/s?k=${req.params.searchInput}`)
    .then(function (response) {
      const $ = cheerio.load(response.data);
      products = [];
      $("div.s-result-item").each(function (i, elem) {
        // const product = $(elem).find('span.a-text-normal').text();
        const productLink = $(elem).find("a.a-link-normal").attr("href");
        products.push(
          // product: product,
          productLink
        );
      });
      //   let users = [];
      let promises = [];
      let savedItems = [];
      for (i = 0; i < products.length; i++) {
        promises.push(
          products[i] &&
            products[i].slice(0, 5) !== "https" &&
            axios
              .get("https://www.amazon.in" + products[i])
              .then((response) => {
                const $ = cheerio.load(response.data);
                const name = $("body")
                  .find("span.product-title-word-break")
                  .text();
                const price = $("body")
                  .find("span.apexPriceToPay span.a-offscreen")
                  .text()
                  .slice(1);
                //    const link = foodItem.find('a.a-link-normal').attr("href")
                //    const ingredients = foodItem.find('a.a-link-normal').attr("href")
                //    const nutritionInfo = foodItem.find('a.a-link-normal').attr("href")
                let weight;
                $("table.a-normal.a-spacing-micro")
                  .find("tr")
                  .each((i, elem) => {
                    if (
                      $(elem).find("span.a-size-base.a-text-bold").text() ===
                      "Weight"
                    ) {
                      weight = $(elem)
                        .find("span.a-size-base.po-break-word")
                        .text();
                    }
                  });
                let description = [];
                $("ul.a-unordered-list.a-vertical.a-spacing-mini li").each(
                  (i, elem) => {
                    description.push($(elem).find("span.a-list-item").text());
                  }
                );
                const imgUrls = [];
                $("div.imgTagWrapper").each((i, elem) => {
                  $(elem).find("img").attr("src") &&
                    imgUrls.push($(elem).find("img").attr("src"));
                });
                const vnv = $("#vnv-container").find(".vnv-text b").text();
                const foodItem = {
                  name: name,
                  price: price,
                  imgUrls: imgUrls,
                  weight: weight,
                  description: description,
                  veg: vnv,
                };

                console.log(foodItem);
                const newItem = new FoodItem(foodItem);
                newItem.save();
                savedItems.push(newItem);
              })
              .catch((err) => {
                console.log(err);
              })
        );
      }

      Promise.all(promises).then(() => res.status(200).send(savedItems));
    })
    .catch(function (err) {
      res.status(500).send(err.message);
    });
});

app.listen(PORT, function () {
  console.log("App listening on port " + PORT);
});

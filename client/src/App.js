import "./App.css";
import React, { useState, useEffect } from "react";
import axios from "axios";

export default function App() {
  const [categoryData, setcategoryData] = useState(null);
  const [selectedcategory, setSelectedcategory] = useState("");
  const [scrapeResult, setScrapeResult] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:3000/categories")
      .then((res) => {
        setcategoryData(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  const handleClick =() => {
    axios
      .get(`http://localhost:3000/scrape/${selectedcategory}`)
      .then((res) => {
        setScrapeResult(res.data);
        alert("Food Item Details stored in database successfully.")
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const categoryChange = (event) => {
    if (event.target.value) {
      setSelectedcategory(event.target.value);
    }
  };
  return (
    <div className="App">
      <div>
        <p>Scraping :<a href="https://www.jiomart.com/c/groceries/2"> https://www.jiomart.com/c/groceries/2 </a></p>
        <label for="categories">Categories Found:</label>
        <br/>
        <select onChange={categoryChange} name="categories">
          <option value="" />
          {categoryData &&
            categoryData.categories.map((c) => {
              return <option value={c.category}>{c.category}</option>;
            })}
        </select>{" "}
        {categoryData ? "" : <p>Loading...</p>}
        <br />
        <br/>
        <br/>
        <button onClick={handleClick}>Scrape</button>
        <br />
        {/* {scrapeResult && <p className="">
          <strong>{console.log(scrapeResult)}</strong> food items details stored in the database
          </p>} */}
      </div>
    </div>
  );
}

import "./App.css";
import React, { useState, useEffect } from "react";
import axios from "axios";

export default function App() {
  const [categoryData, setcategoryData] = useState(null);
  const [selectedcategory, setSelectedcategory] = useState("");
  const [scrapeResult, setScrapeResult] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [loadState, setLoadState] = useState(0)

  // useEffect(() => {
  //   axios
  //     .get("https://labelblind-webscraper-374108.el.r.appspot.com/categories")
  //     .then((res) => {
  //       setcategoryData(res.data);
  //     })
  //     .catch((err) => {
  //       console.error(err);
  //     });
  // }, []);

  const handleClick = () => {
    setLoadState(1);
    axios
      .get(`https://labelblind-webscraper-374108.el.r.appspot.com/scrape/${searchInput}`)
      .then((res) => {
        setScrapeResult(res.data);
        alert("Food Item Details stored in database successfully.");
      })
      .catch((err) => {
        setLoadState(2)
        console.error(err);

      });
  };

  // const categoryChange = (event) => {
  //   if (event.target.value) {
  //     setSelectedcategory(event.target.value);
  //   }
  // };
  const handleChange = (event) => {
    setSearchInput(event.target.value);
  };
  return (
    <div className="App">
      <div>
        <p>
          Scraping :
          <a href="https://www.amazon.in/"> https://www.amazon.in/ </a>
        </p>
        <label for="categories">Enter product to scrape results for:</label>
        <br />
        <input type="text" name="categories" onChange={handleChange} />
        {/* <select onChange={categoryChange} name="categories">
          <option value="" />
          {categoryData &&
            categoryData.categories.map((c) => {
              return <option value={c.category}>{c.category}</option>;
            })}
        </select>{" "} */}
        {/* {categoryData ? "" : <p>Loading...</p>} */}
        <br />
        <br />
        <br />
        <h5 className="try-again">{loadState === 2? "👇 Try Again " : "👇 Click here"}</h5><br/>
        <button onClick={handleClick}>Scrape</button>
        <br />
        {loadState === 1 && ( scrapeResult ? (
          <div className="result">
            <pre>
              <code>{JSON.stringify(scrapeResult,undefined,"\t")}</code>
            </pre>
          </div>
        ) : (
          <p>Scraping...</p>
        ))}
      </div>
    </div>
  );
}

// Web scraper using mongoDB and cheerio

// Dependencies
var express = require("express");
var mongojs = require("mongojs");
// Require request and cheerio. This makes the scraping possible
var request = require("request");
var cheerio = require("cheerio");

// Initialize Express
var app = express();

// Database configuration
var databaseUrl = "scraper";
var collections = ["scrapedData"];

// Hook mongojs configuration to the db variable
var db = mongojs(databaseUrl, collections);
db.on("error", function(error) {
  console.log("Database Error:", error);
});

// Main route (simple Hello World Message)
app.get("/", function(req, res) {
  res.send("Hello world");
});
// Route 1
// =======
// This route will retrieve all of the data
// from the scrapedData collection as a json (this will be populated
// by the data you scrape using the next route)
app.get("/all", function(req, res) {
  db.scrapedData.find({}, function(err, found) {
    if(err) {
      console.log("An error has occurred " + err);
    }
    else {
      res.json(found);
    }
  });
});
// Route 2
// =======
// When you visit this route, the server will
// scrape data from the site of your choice, and save it to
// MongoDB.
app.get("/scrape", function(req, res) {
  request("https://news.ycombinator.com/", function(error, response, html) {
    var $ = cheerio.load(html);

    $(".title").each(function(i, element) {
      var title = $(this).children("a").text();
      var link = $(this).children("a").attr("href");
      
      if (title || link) {
        db.scrapedData.save({
          title: title, 
          link: link
        },
        function(error, saved) {
          if (error) {
            console.log("An error has occurred " + error);
          }
          else {
            console.log(saved);
          }
        });      
      }
    });
  });
  res.send("Scraped completed");
});
/* -/-/-/-/-/-/-/-/-/-/-/-/- */

// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});

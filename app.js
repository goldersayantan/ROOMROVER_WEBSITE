const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js")
const PORT = process.env.PORT || 8080;
const path = require("path");
const methodoverride = require("method-override");

// Database Setup...
const MONGO_URL = "mongodb://127.0.0.1:27017/roomrover";
async function main()   {
    await mongoose.connect(MONGO_URL);
}
main().then(() => {
    console.log("Connected to DB");
}).catch((err) => {
    console.log(err);
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended : true}));
app.use(methodoverride("_method"));

app.get("/", (req, res) => {
    res.send("This is root.");
});

// index route...
app.get("/listings", async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
});

// New Route...
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
});

// show route...
app.get("/listings/:id", async (req, res) => {
    let {id} = req. params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", {listing});
});

// Create Route...
app.post("/listings", async(req, res) => {
    // let {title, description, image, price, location, country} = req.body;
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
});

// Edit Route...
app.get("/listings/:id/edit", async(req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", {listing});
});

// Update Route...
app.put("/listings/:id", async(req, res) => {
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    res.redirect("/listings");
});

app.delete("/listing/:id", async(req, res) => {
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
});

app.listen(PORT, () => {
    console.log(`App is running on : http://localhost:${PORT}`)
});

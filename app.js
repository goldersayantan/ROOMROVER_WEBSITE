const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js")
const PORT = process.env.PORT || 8080;
const path = require("path");
const methodoverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema} = require("./schema.js");


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
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.send("This is root.");
});

// index route...
app.get("/listings", wrapAsync(async (req, res, next) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
}));

// New Route...
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
});

// show route...
app.get("/listings/:id", wrapAsync(async (req, res, next) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", {listing});
}));

// Create Route...
app.post("/listings", wrapAsync(async(req, res, next) => {
    let result = listingSchema.validate(req.body);
    if(result.error) {
        throw new ExpressError(400, result.error);
    }
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
}));

// Edit Route...
app.get("/listings/:id/edit", wrapAsync(async(req, res, next) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", {listing});
}));

// Update Route...
app.put("/listings/:id", wrapAsync(async(req, res, next) => {
    listingSchema.validate(req.body);
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    res.redirect("/listings");
}));

// Delete Route...
app.delete("/listing/:id", wrapAsync(async(req, res, next) => {
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
}));

app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
})

app.use((err, req, res, next) => {
    let {statusCode = 500, message = "Something Went Wrong"} = err;
    res.render("errors/error.ejs", {err});
});

app.listen(PORT, () => {
    console.log(`App is running on : http://localhost:${PORT}`)
});

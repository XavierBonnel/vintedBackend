const express = require("express");
const formidable = require("express-formidable");
const mongoose = require("mongoose");
require("dotenv").config();
const cloudinary = require("cloudinary").v2;
const cors = require("cors");



const app = express();
app.use(formidable());

app.use(
  cors({
    origin: "https://my--vinted-backend.herokuapp.com/",
  })
);


mongoose.connect(process.env.MONGODB_URI);

const userRoutes = require("./routes/user");
const offerRoutes = require("./routes/offer");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});


app.use(userRoutes);
app.use(offerRoutes);


app.all("*", (req, res) => {
  res.status(404).json({ messsage: "page not found" });
});

app.listen(process.env.PORT, () => {
  console.log("server started");
});

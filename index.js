const express = require("express");
const formidable = require("express-formidable");
const mongoose = require("mongoose");
require("dotenv").config();
const cloudinary = require("cloudinary").v2;
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");



const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Sorry, it's too much for us ^^",
});

const app = express();


app.use(limiter);
app.set("trust proxy", 1);//il semble qu'il faut l'intégrer pour l'utilisation avec Heroku
app.use(helmet());
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

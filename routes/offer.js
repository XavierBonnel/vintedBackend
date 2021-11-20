const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Offer = require("../models/Offer");

const isAuthenticated = require("../middlewares/isAuthenticated");

const cloudinary = require("cloudinary").v2;



router.post("/offer/publish", isAuthenticated, async (req, res) => {
  //vérifier si l'utilisateur est authentifié avant de poster l'annonce à l'aide du token
  try {
    const tokenSent = req.headers.authorization.replace("Bearer ", "");
    const user = await User.findOne({ token: tokenSent });

    const image = req.files.image.path;
    const name = req.fields.name;
    const description = req.fields.description;
    const details = req.fields.details;
    const price = req.fields.price;

    const imageCloud = await cloudinary.uploader.upload(image, {
      folder: `/vinted/offers/${user._id}`,
    });

    //création de la nouvelle annonce
    const newOffer = new Offer({
      product_name: name,
      product_image: imageCloud.secure_url,
      product_description: description,
      product_price: price,
      product_details: details,
      owner: user,
    });

    await newOffer.save();
    res.status(200).json({
      name: newOffer.product_name,
      image: imageCloud.secure_url,
      description: newOffer.product_description,
      price: newOffer.product_price,
      details: newOffer.product_details,
      owner: user.account,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/offers", async (req, res) => {
  try {
    //faire le destructuring
    const { title, priceMin, priceMax, sort, page } = req.query;
    if (sort === "price-desc") {
      sort === -1;
    }
    if (sort === "price-asc") {
      sort === 1;
    }
    let research = {};
    if (title) {
      research.product_name = new RegExp(title, "i");
    }
    if (priceMax || priceMin) {
      research.product_price = {};
      research.product_price.$gte = priceMin;
      research.product_price.$lte = priceMax;
    }
    const perPage = 2;
    const offers = await Offer.find(research)
      .sort({ product_price: sort })
      .limit(perPage)
      .skip(perPage * (page - 1));
    res.json(offers);
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
});

router.put("/offer/modify", isAuthenticated, async (req, res) => {
  try {
    const offerSearched = await Offer.findById(req.query.id);
    const newName = req.fields.product_name;

    if (offerSearched) {
      offerSearched.product_name = newName;
      await offerSearched.save();
      console.log("modification enregistrée");
      res.status(200).json({ message: "modification enregistrée" });
    }
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

router.delete("/offer/delete", isAuthenticated, async (req, res) => {
  try {
    //trouver l'offre à supprimer
    const offerToDelete = Offer.findById(req.query.id);
    await Offer.remove(offerToDelete);
    res.status(200).json({ message: "offer deleted" });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.get("/offer", async (req, res) => {
  try {
    const offerToFind = await Offer.findById(req.query.id);
    if (offerToFind) {
      res.status(200).json(offerToFind);
    }
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
});

module.exports = router;

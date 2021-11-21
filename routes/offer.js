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
    //destructuring
    const { name, description, price, condition, city, brand, size, color } =
      req.fields;

    //image envoyée sur cloudinary
    const image = req.files.image.path;
    const imageCloud = await cloudinary.uploader.upload(image, {
      folder: `/vinted/offers/${user._id}`,
    });

    //création de la nouvelle annonce
    const newOffer = new Offer({
      product_name: name,
      product_image: imageCloud.secure_url,
      product_description: description,
      product_price: price,
      product_details: [
        {
          MARQUE: brand,
        },
        {
          TAILLE: size,
        },
        {
          ÉTAT: condition,
        },
        {
          COULEUR: color,
        },
        {
          EMPLACEMENT: city,
        },
      ],
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
    const { title, priceMin, priceMax, sort} = req.query;

    if (sort === "price-desc") {
      sort === -1;
    }
    if (sort === "price-asc") {
      sort === 1;
    }

    //filtre de recherche
    let research = {};
    if (title) {
      research.product_name = new RegExp(title, "i");
    }
    if (priceMax || priceMin) {
      research.product_price = {};
      research.product_price.$gte = Number(priceMin);
      research.product_price.$lte = Number(priceMax);
    }
  
     let limit = Number(req.query.limit);
     if (!limit) {
       limit = 10;
     }

     let page;
     if (!req.query.page || Number(req.query.page) < 1) {
       page = 1;
     } else {
       page = Number(req.query.page);
     }


    const offers = await Offer.find(research)
      .sort({ product_price: sort })
      .limit(limit)
      .skip((page - 1) * limit)
      .populate({
        path: "owner",
        select: "account",
      });
    res.json(offers);
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
});

router.put("/offer/modify/:id", isAuthenticated, async (req, res) => {
  try {
    const offerSearched = await Offer.findById(req.params.id);

    const { name, description, price, condition, city, brand, size, color } =
      req.fields;

    if (offerSearched) {
      offerSearched.product_name = name;
      offerSearched.product_description = description;
      offerSearched.product_price = price;
      offerSearched.product_details= [
        {
          MARQUE: brand,
        },
        {
          TAILLE: size,
        },
        {
          ÉTAT: condition,
        },
        {
          COULEUR: color,
        },
        {
          EMPLACEMENT: city,
        },
      ],
        await offerSearched.save();
      console.log("modification enregistrée");
      res.status(200).json({ message: "modification enregistrée" });
    }
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

router.delete("/offer/delete/:id", isAuthenticated, async (req, res) => {
  try {
    //trouver l'offre à supprimer
    const offerToDelete = Offer.findById(req.params.id);
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

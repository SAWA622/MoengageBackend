
const express = require("express");
const axios = require("axios");
const jwt = require("jsonwebtoken");

const router = express.Router();
const Review = require("../Models/review");

const verifyToken = (req, res, next) => {
  try {
    const token = req.headers["authorization"];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user_id = decoded.id;
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Invalid token" });
  }
};

router.get("/search", async (req, res) => {
  try {
    const { by_city, by_name, by_type } = req.query;

    if (!by_city && !by_name && !by_type) {
      return res
        .status(400)
        .json({ message: "Please provide a search parameter" });
    }

    let url = "https://api.openbrewerydb.org/breweries?";
    if (by_city) {
      url += `by_city=${by_city}&`;
    }
    if (by_name) {
      url += `by_name=${by_name}&`;
    }
    if (by_type) {
      url += `by_type=${by_type}&`;
    }

    const response = await axios.get(url);
    const data = response.data;
    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({ message: "Please provide a brewery id" });
    }

    const url = `https://api.openbrewerydb.org/breweries/${id}`;

    const response = await axios.get(url);

    const data = response.data;

    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/:id/review", verifyToken, async (req, res) => {
  try {
    const id = req.params.id;
    const user_id = req.user_id;

    const { rating, description } = req.body;
    // Validate the input
    if (!id || !rating || !description) {
      return res
        .status(400)
        .json({ message: "Please provide all the required fields" });
    }

    const review = new Review({ brewery_id: id, user_id, rating, description });
    await review.save();

    res.status(201).json({ message: "Review added successfully" });
  } catch (err) {
    // Handle errors
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id/reviews", async (req, res) => {
  try {
    const id = req.params.id;
    // Validate the input
    if (!id) {
      return res.status(400).json({ message: "Please provide a brewery id" });
    }

    const reviews = await Review.find({ brewery_id: id }).populate(
      "user_id",
      "username"
    );

    res.status(200).json(reviews);
  } catch (err) {
    // Handle errors
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

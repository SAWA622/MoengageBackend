require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(express.json());

app.use(cors());



mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("Database connected"))
.catch((err) => console.error(err));

const authRoutes = require("./Routes/auth");
const breweryRoutes = require("./Routes/brewery");

app.use("/api/auth", authRoutes);
app.use("/api/brewery", breweryRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

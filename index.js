require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db.js")

const app = express();
connectDB();

PORT = process.env.PORT || 8080;

app.use(express.json());

app.use("/auth", require("./routes/route.js"));

app.listen(PORT , () => {
    console.log(`Listening on port ${PORT}`)
})
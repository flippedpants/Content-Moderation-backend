require("dotenv").config();
const express = require("express");
const mongoSanitize = require("express-mongo-sanitize")
const connectDB = require("./config/db.js")

const app = express();
connectDB();

const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(mongoSanitize())

app.use("/auth", require("./routes/route.js"));

app.get("/", (req, res) => {
    res.send("Working")
})

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})
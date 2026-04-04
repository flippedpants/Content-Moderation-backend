require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const mongoSanitize = require("express-mongo-sanitize");
const connectDB = require("./config/db.js")

const app = express();
connectDB();

const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(helmet());
app.use(cors());
app.use((req, res, next) => {
    if (req.body) mongoSanitize.sanitize(req.body, { replaceWith: '_' });
    if (req.query) mongoSanitize.sanitize(req.query, { replaceWith: '_' });
    if (req.params) mongoSanitize.sanitize(req.params, { replaceWith: '_' });
    next();
});

app.use("/auth", require("./routes/route.js"));
app.use("/api", require("./routes/api.js"));

app.get("/", (req, res) => {
    res.send("Working")
})

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})
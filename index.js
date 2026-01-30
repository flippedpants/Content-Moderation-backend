const express = require("express");
const app = express();

PORT = 3000;

app.use(express.json());

const moderateRoute = require("./routes/moderate.js")

app.use("/api/moderate" , moderateRoute);

app.listen(PORT , () => {
    console.log("Listening on port 3000")
})
const express = require("express");
const router = express.Router();

router.post("/", (req,res) => {
    const { text } = req.body;
    let label = "safe";

    if(!text){
        return res.status(400).json({ error: "Text is required! "})
    }

    if (text.toLowerCase().includes("stupid")) {
    label = "toxic";
  }

  res.json({ text, label, confidence: 0.85 });
})

module.exports = router;
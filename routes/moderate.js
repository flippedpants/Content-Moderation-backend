const express = require("express");
const router = express.router();

router.post('/' , (req,res) => {
    const {text} = req.body;

    if(!text){
        return res.status(json).json({ error : "Text is required!"})
    }

    let label = "safe";
    if(label.toLowerCase().includes("stupid")){
        label = "toxic";
    }

    res.json({ text, label , confidence_score: 0.85});
})

module.exports = router;
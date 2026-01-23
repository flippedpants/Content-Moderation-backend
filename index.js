const express = require("express")

const app = express();

app.use(express.json());

app.get('/' , (req,res) => {
    console.log('WOW')
    res.send("Running")
})

app.post("/api/moderate", (req,res) => {
    const {text} = req.body;

    if(!text){
        return res.status(400).json({error : "Text is required"})
    }

    let label = "safe";

    if(text.toLowerCase().includes("stupid")){
        label = "toxic";
    }

    res.json({
        text,
        label,
        confidence: 0.8
    })
})

const PORT = 3000
app.listen(PORT, () => {
    console.log(`Server running on port - ${PORT}`)
})
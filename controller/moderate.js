const ModerationLog = require("../models/moderationLog.js");

const moderate = async(req,res)=>{
  const { text } = req.body;
  const { appId } = req.appContext;

  let label = "safe";

  if(!text){
    return res.status(400).json({ error: "Text is required! "})
  }

  if (text.toLowerCase().includes("stupid")) {
    label = "toxic";
  }

  const newModerationLog = new ModerationLog({
    appId: appId,
    text: text,
    label: label,
    confidence: 0.85
  })

  await newModerationLog.save();

  res.json({ text, label, confidence: 0.85 });
}


module.exports = moderate;
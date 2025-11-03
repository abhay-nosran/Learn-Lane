require('dotenv').config()
require("./Data/database/connection");
const UserController = require("./controllers/User/UserController")
const express = require("express") ;
const PORT = process.env.PORT ;
const app = express() ;

const generateShallowSubtopic = require("./Data/createShallowSubtopic")

app.use(express.json());
app.post("/createTopic",(req,res)=>{
    res.status(200).json({message : "to be implemented"}) 
}) ;

app.get("/test", async (req, res) => {
    console.log("test route!")
  try {
    const subtopic = await generateShallowSubtopic({
  topicName: "Introduction to REST APIs",
  topicId: null,
  parentId: null,
  context: "Explaining how REST APIs work in web systems",
  generationGoal: "Generate outline-level understanding",
  experienceLevel: "Intermediate",
  timelinePortion: 0.2,
  additionalHints: ["focus on HTTP methods", "avoid deep code examples"],
});


    res.status(200).json({ message: "✅ Shallow subtopic created", subtopic });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/users",UserController.createUser);

app.listen(PORT,()=>{
    console.log(`Learn Lane is listening on ${PORT}`) ;
})
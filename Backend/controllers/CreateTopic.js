const createTopic = require("../service/CreateTopic")

class CreateTopic {
  constructor() {
    throw new Error("Can't initialize CreateTopic static class");
  }

  // POST /topic/createTopic
  static async createTopic(req, res) {

    // currently public userId is taken from body 
    // later will extract it from the token(authorization)
    
    try {
      const { numDays, topicName, experienceLevel, userId } = req.body;

      if (!numDays || !topicName || !experienceLevel || !userId) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const topic = await createTopic(numDays, topicName, experienceLevel, userId) ;

      return res.status(201).json({
        message: "Topic created successfully",
        topic,
      });
    } catch (err) {
      console.error("Error creating topic:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
}

export default CreateTopic;

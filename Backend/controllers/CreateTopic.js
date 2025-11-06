const CreateTopicService = require("../service/CreateTopic")
const getSubTopicService = require("../service/subTopic/getSubtopic") 

class Topic {
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

      const topic = await CreateTopicService.createTopic(numDays, topicName, experienceLevel, userId) ;

      return res.status(201).json({
        message: "Topic created successfully",
        topic,
      });
    } catch (err) {
      console.error("Error creating topic:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }

static async getSubTopic(req, res) {
  try {
    const { subTopicId } = req.params;
   const reGenerate = String(req.body?.reGenerate ?? "").toLowerCase() === "true";

   console.log(reGenerate)
    const subTopic = await getSubTopicService(subTopicId,reGenerate);

    if (!subTopic) {
      return res.status(404).json({
        success: false,
        message: "Subtopic not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: subTopic
    });

  } catch (error) {
    console.error("Error fetching subtopic:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
}

}

module.exports = Topic;

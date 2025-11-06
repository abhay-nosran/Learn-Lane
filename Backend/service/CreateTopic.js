const { nanoid } = require("nanoid");
const Topic = require("../Data/database/Models/topic");
const createShallowSubtopic = require("../Data/createShallowSubtopic");
const generateSubtopic = require("./subTopic/generateSubtopic");
const UserService = require("./User/UserService");

class CreateTopic {
  constructor() {
    throw new Error("Cannot instantiate CreateTopic class!");
  }

  static async createTopic(numDays, topicName, experienceLevel, userId) {
    try {
        const user = await UserService.getUserByPublicId(userId) ;
        if (!user) throw new Error("User not found");

      // 1. Create a new topic
      const topic = await Topic.create({
            publicId: nanoid(10),
            name: topicName,
            numDays,
            experienceLevel,
            userId: user._id, // use internal ObjectId
        });

      // 2. Create the root (shallow) subtopic for this topic
      const subtopic = await createShallowSubtopic({
        topicName ,
        topicId : topic._id,
        parentId : null,
        experienceLevel , 
        timelinePortion : numDays ,
        context : `Introduction and overview of ${topicName}`,
        generationGoal: `Generate an outline for ${topicName}`,
      })

      // 3. Associate subtopic with topic
      topic.subtopicId = subtopic._id;
      await topic.save();

      // 4. Trigger AI generation or placeholder function
      const res = await generateSubtopic(subtopic.publicId);

      return { topic, res};
    } catch (err) {
      console.error("Error creating topic:", err);
      throw err;
    }
  }

}

module.exports = CreateTopic;

const Subtopic = require("./database/Models/subtopic");

async function createShallowSubtopic({
  topicName,
  topicId, // internal object id
  parentId = null, // internal object id
  context = "",
  generationGoal = "",
  experienceLevel,
  timelinePortion = 1,
  additionalHints = {},
  level = 0 
}) {
  const subtopic = await Subtopic.create({
    name: topicName,
    type: "not-decided",
    status: "not_generated",
    meta: {
      level: level,
      parentId,
      topicId,
      context,
      generationGoal,
      experienceLevel,
      timelinePortion,
      additionalHints,
    },
  });

  return subtopic;
}

module.exports = createShallowSubtopic;

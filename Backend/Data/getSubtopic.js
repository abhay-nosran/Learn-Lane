const Subtopic = require("./database/Models/subtopic");

async function getSubtopic(publicId) {
  try {
    const subtopic = await Subtopic.findOne({ publicId });
    return subtopic;
  } catch (err) {
    console.error("Error fetching subtopic:", err);
    throw err;
  }
}

module.exports = getSubtopic;

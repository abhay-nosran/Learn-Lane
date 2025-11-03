const Subtopic = require("./database/Models/subtopic")

async function createSubtopicsInDb(shallowChildren) {
  try {
    const createdSubtopics = await Subtopic.insertMany(shallowChildren);
    return createdSubtopics;
  } catch (err) {
    console.error("Error creating shallow subtopics:", err);
    throw err;
  }
}

module.exports = createSubtopicsInDb;
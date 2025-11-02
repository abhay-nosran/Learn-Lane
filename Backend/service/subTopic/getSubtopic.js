const getSubtopicFromDb = require("../../Data/getSubtopic");
const generateSubtopic = require("./generateSubtopic");

// Returns subtopic data to the user
async function getSubtopic(subtopicId) {
  // 1. Fetch subtopic from database
  let subtopic = await getSubtopicFromDb(subtopicId);
  if (!subtopic) throw new Error("Subtopic not found");

  // 2. Generate if not generated
  if (subtopic.status === "not_generated") {
    await generateSubtopic(subtopicId, subtopic.meta);
    subtopic = await getSubtopicFromDb(subtopicId);
  }

  // 3. If still not generated, return error
  if (subtopic.status === "not_generated") {
    throw new Error("Subtopic generation failed");
  }

  // 4. Return structured response
  if (subtopic.type === "data") {
    return {
      type: "data",
      name: subtopic.name,
      content: subtopic.data
    };
  }

  // 5. For group-type subtopics, return list of children
  return {
    type: "group",
    name: subtopic.name,
    content: subtopic.children.map(c => ({
      id: c.id,
      name: c.name
    }))
  };
}

module.exports = getSubtopic;

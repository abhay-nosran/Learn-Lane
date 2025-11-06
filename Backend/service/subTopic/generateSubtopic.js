const getSubtopicFromDb = require("../../Data/getSubtopic");
const updateSubtopicInDb = require("../../Data/updateSubtopicInDb");
const createSubtopicsInDb = require("../../Data/createSubtopicsInDb");
const generateSubtopicFromAI = require("../../AI/generateSubtopicFromAI");

// Generate a subtopic and update it in the database
async function generateSubtopic(subtopicId) {
  // 1. Fetch subtopic
  const subTopic = await getSubtopicFromDb(subtopicId);
  if (!subTopic) throw new Error("Subtopic not found");

  // 2. Skip if already generated
  // if (subTopic.status === "generated") return subTopic;

  // 3. Generate new data from AI based on meta
  const generated = await generateSubtopicFromAI(subTopic.meta);
  if (!generated || !generated.type) throw new Error("AI generation failed");

  // 4. Update DB according to the type
  if (generated.type === "data") {
    // Direct content-type node
    await updateSubtopicInDb(subtopicId, {
      type: "data",
      status: "generated",
      data: generated.content,
    });
  } else if (generated.type === "group") {
    // Group node — create shallow subtopics
    const shallowChildren = generated.children.map(c => ({
      name: c.name,
      meta: {
        parentId: subTopic._id,
        topicId: subTopic.meta.topicId,
        context: c.meta?.context || subTopic.meta.context,
        generationGoal: c.meta?.generationGoal || `Generate content for ${c.name}`,
        level: (subTopic.meta.level || 0) + 1,
        timelinePortion : c.meta?.timelinePortion 
      },
    }));

    // Save shallow subtopics
    const inserted = await createSubtopicsInDb(shallowChildren);

    // Update parent with child references
    await updateSubtopicInDb(subtopicId, {
      type: "group",
      status: "generated",
      children: inserted.map(s => ({ id: s._id, name: s.name , publicId : s.publicId})),
    });
  }

  // 5. Return updated subtopic
  return await getSubtopicFromDb(subtopicId);
}

module.exports = generateSubtopic;

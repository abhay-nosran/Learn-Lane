//  {
//       type: "data",
//       status: "generated",
//       data: generated.content,
// }

// {
//       type: "group",
//       status: "generated",
//       children: [data],
// }

// object 

// just update these field in the sub-topic 

const Subtopic = require("./database/Models/subtopic")

async function updateSubtopicInDb(subtopicId, object) {
  try {
    const updatedSubtopic = await Subtopic.findOneAndUpdate(
      { publicId: subtopicId },  // find using your public unique id
      { $set: object },          // update only provided fields
      { new: true }              // return the updated document
    );

    return updatedSubtopic;
  } catch (err) {
    console.error("Error updating subtopic:", err);
    throw err;
  }
}

module.exports = updateSubtopicInDb;

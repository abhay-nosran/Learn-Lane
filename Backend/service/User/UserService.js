const { nanoid } = require("nanoid");
const User = require("../../Data/database/Models/user");

class UserService {
  constructor() {
    throw Error("Can't create a User Class");
  }

  static async createUser(email, password) {
    try {
      const existing = await User.findOne({ email });
      if (existing) throw new Error("User already exists");

      const user = await User.create({
        publicId: nanoid(10),
        email,
        passwordHash: password, // will be auto-hashed by pre-save hook
      });

      return {publicId : user.publicId ,email : user.email };
    } catch (err) {
      console.error("Error creating user:", err);
      throw err;
    }
  }

  static async getUserByEmail(email) {
    return User.findOne({ email });
  }

  static async getUserByPublicId(publicId) {
    return User.findOne({ publicId });
  }
}

module.exports = UserService;

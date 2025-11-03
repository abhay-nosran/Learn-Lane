const UserService = require("../../service/User/UserService");

class UserController {
  constructor() {
    throw Error("Can't instantiate UserController class");
  }

  // POST /users
  static async createUser(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password)
        return res.status(400).json({ message: "Email and password required" });

      const user = await UserService.createUser(email, password);
      return res.status(201).json({ message: "User created", user });
    } catch (err) {
      console.error("CreateUser error:", err.message);
      return res.status(500).json({ message: err.message });
    }
  }

  // GET /users/email/:email
  static async getUserByEmail(req, res) {
    try {
      const { email } = req.params;
      const user = await UserService.getUserByEmail(email);
      if (!user) return res.status(404).json({ message: "User not found" });
      return res.json(user);
    } catch (err) {
      console.error("GetUserByEmail error:", err.message);
      return res.status(500).json({ message: err.message });
    }
  }

  // GET /users/id/:publicId
  static async getUserByPublicId(req, res) {
    try {
      const { publicId } = req.params;
      const user = await UserService.getUserByPublicId(publicId);
      if (!user) return res.status(404).json({ message: "User not found" });
      return res.json(user);
    } catch (err) {
      console.error("GetUserByPublicId error:", err.message);
      return res.status(500).json({ message: err.message });
    }
  }
}

module.exports = UserController;

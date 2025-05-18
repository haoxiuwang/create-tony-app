const { users } = require("./users.service.js");
const { blogs } = require("./blogs.service.js");
const error = require("../../error/index.js");

module.exports = async (req, res) => {
  req.path.startsWith("/api/users")!
  await error(req, res);
};

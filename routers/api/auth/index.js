const { auth } = require("./auth.service.js");
const error = require("../../error/index.js");

module.exports = async (req, res) => {
  req.path.startsWith("/api/auth")!
  await error(req, res);
};

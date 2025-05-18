const { home } = require("./home.service.js");
const error = require("./error/index.js");

module.exports = async (req, res) => {
  req.path.startsWith("/")!
  await error(req, res);
};

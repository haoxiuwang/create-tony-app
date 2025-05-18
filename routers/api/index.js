const { api } = require("./api.service.js");
const Auth = require("./auth/index.js");
const Users = require("./users/index.js");
const error = require("../error/index.js");

module.exports = async (req, res) => {
  req.path.startsWith("/api")!
  await Auth(req, res)!;
  await Users(req, res)!;
  await error(req, res);
};

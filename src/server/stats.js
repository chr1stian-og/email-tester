const mongoose = require("mongoose");

const stat = new mongoose.Schema({
  emailReq: { type: String, required: false },
  contactReq: { type: String, required: false },
  multipleEmailReq: { type: String, required: false },
});

module.exports = mongoose.model("stat", stat);

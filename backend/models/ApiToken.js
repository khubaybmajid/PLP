const mongoose = require('mongoose');

const ApiTokenSchema = new mongoose.Schema({
  apiName: String,
  accessToken: String,
  refreshToken: String,
  expiresAt: Date,
});

module.exports = mongoose.model('ApiToken', ApiTokenSchema);

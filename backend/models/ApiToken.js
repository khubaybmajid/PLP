const mongoose = require('mongoose');

const TokenSchema = new mongoose.Schema({
  accessToken: String,
  refreshToken: String,
  expiresAt: Date
});

const TokenModel = mongoose.model('Token', TokenSchema);

const saveToken = async (accessToken, refreshToken, expiresAt) => {
  await TokenModel.deleteMany({}); // Delete all existing tokens (because we only store one)
  const token = new TokenModel({ accessToken, refreshToken, expiresAt });
  await token.save();
};

const getToken = async () => {
  return await TokenModel.findOne({});
};

module.exports = { saveToken, getToken };

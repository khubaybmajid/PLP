const mongoose = require('mongoose');

const TokenSchema = new mongoose.Schema({
  accessToken: String,
  refreshToken: String,
  expiresAt: Date
});

const TokenModel = mongoose.model('ApiTokens', TokenSchema);

const saveToken = async (accessToken, refreshToken, expiresAt) => {
  await TokenModel.deleteMany({}); 
  const token = new TokenModel({ accessToken, refreshToken, expiresAt });
  await token.save();
};

const getToken = async () => {
  const token = await TokenModel.findOne({});
  console.log("Retrieved token: ", token);
  return token;
};


module.exports = { saveToken, getToken };

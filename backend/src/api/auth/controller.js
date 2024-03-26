const repository = require("./repository");
const bcyrpt = require("bcrypt");
const { signAccessToken, signRefreshToken, signForgetPasswordToken } = require("../../utils/helpers/jwt-token-helper");
const {verify} = require("jsonwebtoken");
const dotenv = require("dotenv").config();
const { sendMail } = require("../../utils/helpers/send-email");

const modules = {};

const roles = ["","SYSTEM_ADMIN", "STS_MANAGER","LANDFILL_MANAGER", "UNASSIGNED"];

modules.login = async (req, res) => {
  const cred = req.body;

  if (!cred.username || !cred.password)
      return res.status(400).json({ message: "Bad request." });

  user = await repository.getUserByUsername(cred.username).catch(() => {
      return res.status(500).json({ message: "Internal server error." });
  });

  if (!user)
      return res.status(401).json({ message: "User not found." });

  const isMatch = await bcyrpt.compare(cred.password, user.password);

  if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials." });

  // get user roles
  if( !user.role_id || user.role_id < 1 || user.role_id > 4) user.role_id = 4;
  const role = roles[user.role_id];

//   console.log(role);

  const accessToken = signAccessToken(user.user_id, user.username, role);
  const refreshToken = signRefreshToken(user.username);
  repository.saveRefreshToken(user.user_id, refreshToken);
  if( user.active == false){
    return res.status(200).json({ accessToken, refreshToken, active: false});
  }
  res.status(200).json({ accessToken, refreshToken });
};

modules.logout = async (req, res) => {
    const user = req.user;
    const token = req.body.token;
    if (!token)
        return res.status(400).json({ message: "Bad request." });

    await repository.deleteRefreshToken(user.user_id, token);
    res.status(200).json({ message: "Logged out." });
}

modules.changePassword = async (req, res) => {
   
    const cred = req.body;
    const token = cred.token; 
    
    if (!cred.old_password || !cred.new_password)
        return res.status(400).json({ message: "Bad request." });

    const decoded = verify(token, process.env.JWT_SECRET_KEY);
    
    const user = await repository.getUserById(decoded.user_id);
    if (!user)
        return res.status(404).json({ message: "User not found." });

    const isMatch = await bcyrpt.compare(cred.old_password, user.password);
    if (!isMatch)
        return res.status(401).json({ message: "Invalid credentials." });

    const hashedPassword = await bcyrpt.hash(cred.new_password, 10);
    await repository.updatePassword(user.user_id, hashedPassword);
    await repository.updateActive(user.user_id, true);
    res.status(200).json({ message: "Password updated." });
}

modules.initiateResetPassword = async (req, res) => {
    const cred = req.body;
    if (!cred.email)
        return res.status(400).json({ message: "Bad request." });

    const user = await repository.getUserByEmail(cred.email);
    if (!user)
        return res.status(404).json({ message: "User not found." });

    const forgetPasswordToken = signForgetPasswordToken(user.username);
    sendMail(user.email, "Reset password", `Hello ${user.name},\n\nYou can reset your password using the following link: http://localhost:3000/auth/reset/${forgetPasswordToken}`);
    res.status(200).json({ forgetPasswordToken });
}

modules.resetPassword = async (req, res) => {
    const cred = req.body;
    const token = cred.token;
    if (!cred.new_password)
        return res.status(400).json({ message: "Bad request." });

    const decoded = verify(token, process.env.JWT_SECRET_KEY);

    if( decoded.type !== "forget-password-token") 
        return res.status(400).json({ message: "Invalid token." });

    const user = await repository.getUserByUsername(decoded.username);
    if (!user)
        return res.status(404).json({ message: "User not found." });

    const hashedPassword = await bcyrpt.hash(cred.new_password, 10);
    await repository.updatePassword(user.user_id, hashedPassword);
    res.status(200).json({ message: "Password updated." });
}

modules.refreshToken = async (req, res) => {
    const cred = req.body;
    const token = cred.token;
    if (!token)
        return res.status(400).json({ message: "Bad request." });

    const decoded = verify(token, process.env.REFRESH_TOKEN_SECRET_KEY);
    const user = await repository.getUserByUsername(decoded.username);
    if (!user)
        return res.status(404).json({ message: "User not found." });

    const savedToken = await repository.getRefreshToken(user.user_id, token);
    if( !savedToken)
        return res.status(401).json({ message: "Invalid token." });

    const accessToken = signAccessToken(user.user_id, user.username, user.role);
    res.status(200).json({ accessToken });
}

module.exports = modules;

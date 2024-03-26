const repository = require("./repository");
const bcyrpt = require("bcrypt");
const modules = {};

modules.addUser = async (req, res) => {
  const user = req.body;
  user.password = await bcyrpt.hash(user.password, 10);
  const createdUser = await repository.createUser(user);
  res.status(201).json(createdUser);
}


modules.getAllUsers = async (req, res) => {
  const users = await repository.getUsers();
  res.status(200).json(users);
};

modules.getUser = async (req, res) => {
  const user_id = req.params.user_id;
  const user = await repository.getUser(user_id);
  res.status(200).json(user);
}



modules.deleteUser = async(req, res) => {
  const user_id = req.params.user_id;
  if( req.user.user_id+"" === user_id ){
    return res.status(401).json({message: `Cannot delete yourself`});
  }

  await repository.deleteUser(user_id);
  res.status(200).json({"message":"Deleted successfully"});
}

modules.updateUser = async (req, res) => {
  const loggedInUser = req.user;
  const user_id = req.params.user_id;
  const user = req.body;
  // console.log(loggedInUser);
  if( !loggedInUser.roles.includes("SYSTEM_ADMIN") && loggedInUser.user_id+"" !== user_id ){
    return res.status(401).json({message: `Unauthorized`});
  }
  const updatedUser = await repository.updateUser(user_id, user);
  res.status(200).json(updatedUser);
}

modules.getAllRoles = async (req, res) => {
  const roles = await repository.getRoles();
  res.status(201).json(roles);
}

modules.updateUserRoles = async (req, res) => {
  const user_id = req.params.user_id;
  const roles = req.body.roles;
  for(const role in roles){
    await repository.addRole(user_id,role);
  }
  return res.status(201).json({"message":"Roles updated successfully"});
}

modules.getProfile = async (req, res) => {
  const user = req.user;
  const userProfile = await repository.getUser(user.user_id);
  return res.status(201).json(userProfile);
}

modules.updateProfile = async (req, res) => {
  const user = req.user;
  const userProfile = req.body.profile;
  await repository.updateUser(user.user_id, userProfile);
}


module.exports = modules;
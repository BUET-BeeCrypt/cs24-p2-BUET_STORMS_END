const repository = require("./repository");

const route_service = require("../routing/controller");
const userRepository = require("../user/repository");
const modules = {};

modules.createLandfill = async (req, res) => {
  const landfill = req.body;
  try{
    const createdLandfill = await repository.createLandfill(landfill);
    route_service.createRoutesFromLandfill(createdLandfill.landfill_id);
    res.status(201).json(createdLandfill);
  }catch(err){
    res.status(500).json({message:err.message});
  }
};

modules.getLandfills = async (req, res) => {
  try{
    const landfills = await repository.getLandfills();
    res.status(200).json(landfills);
  }catch(err){
    res.status(500).json({message:err.message});
  }
};

modules.getLandfill = async (req, res) => {
  try{
    const landfill_id = req.params.landfill_id;
    const exists = await repository.existsLandfill(landfill_id);
    if (!exists) return res.status(404).json({ message: "Landfill not found" });
    const landfill = await repository.getLandfill(landfill_id);
    res.status(200).json(landfill);
  }catch(err){
    res.status(500).json({message:err.message});
  }
};

modules.updateLandfill = async (req, res) => {
  const landfill_id = req.params.landfill_id;
  try{
    const exists = await repository.existsLandfill(landfill_id);
    if (!exists) return res.status(404).json({ message: "Landfill not found" });
    const landfill = req.body;
    const updatedLandfill = await repository.updateLandfill(
      landfill_id,
      landfill
    );
    res.status(200).json(updatedLandfill);
  }catch(err){
    res.status(400).json({message:err.message});
  }
};

modules.deleteLandfill = async (req, res) => {
  const landfill_id = req.params.landfill_id;
  try{
    const exists = await repository.existsLandfill(landfill_id);
    if (!exists) return res.status(404).json({ message: "Landfill not found" });
    await repository.deleteLandfill(landfill_id);
    res.status(200).json({ message: "Landfill deleted" });
  }catch(err){
    res.status(400).json({message:err.message});
  }
};

modules.addManagerToLandfill = async (req, res) => {
  const { landfill_id } = req.params;
  const { user_id } = req.body;

  try {
    const exists = await repository.existsLandfill(landfill_id);
    if (!exists) return res.status(404).json({ message: "Landfill not found" });

    const user = await userRepository.getUser(user_id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // check role
    if (user.role_name !== "LANDFILL_MANAGER")
      return res
        .status(400)
        .json({ message: "User is not a landfill manager" });

    const isManager = await repository.isManagerOfLandfill(
      landfill_id,
      user_id
    );
    if (isManager)
      return res
        .status(400)
        .json({ message: "Manager is already assigned to landfill" });

    await repository.addManagerToLandfill(landfill_id, user_id);
    res.status(200).json({ message: "Manager assigned to landfill" });
  } catch (err) {
    return res.status(404).json({ message: "Manager or landfill not found" });
  }
};

modules.getManagersOfLandfill = async (req, res) => {
  const landfill_id = req.params.landfill_id;
  const managers = await repository.getManagersOfLandfill(landfill_id);
  res.status(200).json(managers);
};

modules.removeManagerFromLandfill = async (req, res) => {
  const { landfill_id, user_id } = req.params;
  try {
    const exists = await repository.existsLandfill(landfill_id);
    if (!exists) return res.status(404).json({ message: "STS not found" });

    const user = await userRepository.getUser(user_id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isManager = await repository.isManagerOfLandfill(
      landfill_id,
      user_id
    );
    if (!isManager)
      return res
        .status(404)
        .json({ message: "User is not a manager of this landfill" });

    await repository.removeManagerFromLandfill(landfill_id, user_id);
    res.status(200).json({ message: "Manager removed from landfill" });
  } catch (err) {
    if (err.code === 404) return res.status(404).json({ message: err.message });
    res.status(500).json({ message: err.message });
  }
};

modules.addEntryToLandfill = async (req, res) => {
  const manager_id = req.user.user_id;

  try{
    const landfill_id = await repository.getLandfillIdfromManagerId(manager_id);

    if (landfill_id === null) {
      return res
        .status(404)
        .json({ message: "Manager is not assigned to any landfill" });
    }

    const { entry_time, vehicle_id, weight } = req.body;

    await repository.createBill(vehicle_id, weight, landfill_id);
    const entry = await repository.addEntryToLandfill(
                        landfill_id,
                        manager_id,
                        entry_time,
                        vehicle_id,
                        weight
                      );

    if (entry === null) {
      return res
        .status(200)
        .json({ message: "No fleet" });
    }

    res
      .status(201)
      .json(
        {
          message: "Entry added to landfill",
        }
      );
    }catch(err){
      res.status(500).json({message:err.message});
    }
};

modules.getEntriesOfLandfill = async (req, res) => {
  const landfill_id = await repository.getLandfillIdfromManagerId(
    req.user.user_id
  );

  if (landfill_id === null) {
    return res
      .status(404)
      .json({ message: "Manager is not assigned to any landfill" });
  }

  const page = Number.parseInt(req.query.page) || 1;
  const limit = Number.parseInt(req.query.limit) || 50;

  const entries = await repository.getEntriesOfLandfill(
    landfill_id,
    page,
    limit
  );
  res.status(200).json(entries);
};

modules.getArrivalEntriesOfLandfill = async (req, res) => {
  try{
    const landfill_id = await repository.getLandfillIdfromManagerId(
      req.user.user_id
    );

    if (landfill_id === null) {
      return res
        .status(404)
        .json({ message: "Manager is not assigned to any landfill" });
    }

    const entries = await repository.getOnlyEntriesOfLandfill(landfill_id);
    res.status(200).json(entries);
  }catch(err){
    res.status(500).json({message:err.message});
  }
};

modules.addDepartureToLandfill = async (req, res) => {
  const { landfill_entry_id } = req.params;
  const { departure_time } = req.body;

  const manager_id = req.user.user_id;
  const landfill_id = await repository.getLandfillIdfromManagerId(manager_id);

  if (landfill_id === null) {
    return res
      .status(404)
      .json({ message: "Manager is not assigned to any landfill" });
  }

  await repository.addDepartureToLandfill(landfill_entry_id, departure_time);
  res.status(200).json({ message: "Departure added to landfill" });
};

modules.getLandfillOfManager = async (req, res) => {
  const manager_id = req.user.user_id;
  const landfill_id = await repository.getLandfillIdfromManagerId(manager_id);

  if (landfill_id === null) {
    return res
      .status(404)
      .json({ message: "Manager is not assigned to any landfill" });
  }

  const landfill = await repository.getLandfill(landfill_id);
  res.status(200).json(landfill);
};

modules.getVehiclesOfManager = async (req, res) => {
  const manager_id = req.user.user_id;
  const landfill_id = await repository.getLandfillIdfromManagerId(manager_id);

  if (landfill_id === null) {
    return res
      .status(404)
      .json({ message: "Manager is not assigned to any landfill" });
  }

  const vehicles = await repository.getVehiclesOfLandfill(landfill_id);
  res.status(200).json(vehicles);
};

modules.getLandfillBills = async (req, res) => {
  const landfill_id = await repository.getLandfillIdfromManagerId(
    req.user.user_id
  );

  if (landfill_id === null) {
    return res
      .status(404)
      .json({ message: "Manager is not assigned to any landfill" });
  }

  const page = Number.parseInt(req.query.page) || 1;
  const limit = Number.parseInt(req.query.limit) || 500;

  const bills = await repository.getLandfillBills(landfill_id, page, limit);
  res.status(200).json(bills);
}

module.exports = modules;

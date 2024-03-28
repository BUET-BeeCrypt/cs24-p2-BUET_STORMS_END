import { api_url } from ".";
import axios from "axios";

export const getUsers = async () =>
  axios.get(api_url(`/users`)).then((res) => res.data);

export const getRoles = async () =>
  axios.get(api_url(`/users/roles`)).then((res) => res.data);

export const changeUserRole = async (id, role) =>
  axios
    .put(api_url(`/users/${id}/roles`), { role_name: role })
    .then((res) => res.data);

export const editUser = async (id, username, email, name, active, banned) =>
  axios
    .put(api_url(`/users/${id}`), { username, email, name, active, banned })
    .then((res) => res.data);

export const deleteUser = async (id) =>
  axios.delete(api_url(`/users/${id}`)).then((res) => res.data);

export const addSTS = async (
  zone_no,
  ward_no,
  name,
  location,
  latitude,
  longitude,
  capacity,
  dump_area,
  coverage_area
) =>
  axios
    .post(api_url("/sts"), {
      zone_no,
      ward_no,
      name,
      location,
      latitude,
      longitude,
      capacity,
      dump_area,
      coverage_area,
    })
    .then((res) => res.data);

export const getSTSs = async () =>
  axios.get(api_url(`/sts`)).then((res) => res.data);

export const getSTS = async (sts_id) =>
  axios.get(api_url(`/sts/${sts_id}`)).then((res) => res.data);

export const updateSTS = async (
  sts_id,
  zone_no,
  ward_no,
  name,
  location,
  latitude,
  longitude,
  capacity,
  dump_area,
  coverage_area
) =>
  axios
    .put(api_url(`/sts/${sts_id}`), {
      zone_no,
      ward_no,
      name,
      location,
      latitude,
      longitude,
      capacity,
      dump_area,
      coverage_area,
    })
    .then((res) => res.data);

export const deleteSTS = async (sts_id) =>
  axios.delete(api_url(`/sts/${sts_id}`)).then((res) => res.data);

export const addManagerToSTS = async (sts_id, user_id) =>
  axios
    .post(api_url(`/sts/${sts_id}/managers`), { user_id })
    .then((res) => res.data);

export const getManagersOfSTS = async (sts_id) =>
  axios.get(api_url(`/sts/${sts_id}/managers`)).then((res) => res.data);

export const removeManagerFromSTS = async (sts_id, user_id) =>
  axios
    .delete(api_url(`/sts/${sts_id}/managers/${user_id}`))
    .then((res) => res.data);

export const getLandfills = async () =>
  axios.get(api_url(`/landfill`)).then((res) => res.data);

export const getLandfill = async (landfill_id) =>
  axios.get(api_url(`/landfill/${landfill_id}`)).then((res) => res.data);

export const addLandfill = async (name, latitude, longitude) =>
  axios
    .post(api_url("/landfill"), { name, latitude, longitude })
    .then((res) => res.data);

export const updateLandfill = async (landfill_id, name, latitude, longitude) =>
  axios
    .put(api_url(`/landfill/${landfill_id}`), { name, latitude, longitude })
    .then((res) => res.data);

export const deleteLandfill = async (landfill_id) =>
  axios.delete(api_url(`/landfill/${landfill_id}`)).then((res) => res.data);

export const addManagerToLandfill = async (landfill_id, user_id) =>
  axios
    .post(api_url(`/landfill/${landfill_id}/managers`), { user_id })
    .then((res) => res.data);

export const getManagersOfLandfill = async (landfill_id) =>
  axios
    .get(api_url(`/landfill/${landfill_id}/managers`))
    .then((res) => res.data);

export const removeManagerFromLandfill = async (landfill_id, user_id) =>
  axios
    .delete(api_url(`/landfill/${landfill_id}/managers/${user_id}`))
    .then((res) => res.data);

export const getVehicles = async () =>
  axios.get(api_url(`/vehicles`)).then((res) => res.data);

export const getVehicle = async (vehicle_id) =>
  axios.get(api_url(`/vehicles/${vehicle_id}`)).then((res) => res.data);

export const addVehicle = async (
  registration,
  type,
  capacity,
  disabled,
  fuel_cost_per_km_loaded,
  fuel_cost_per_km_unloaded,
  landfill_id
) =>
  axios
    .post(api_url("/vehicles"), {
      registration,
      type,
      capacity,
      disabled,
      fuel_cost_per_km_loaded,
      fuel_cost_per_km_unloaded,
      landfill_id,
    })
    .then((res) => res.data);

export const updateVehicle = async (
  vehicle_id,
  registration,
  type,
  capacity,
  disabled,
  fuel_cost_per_km_loaded,
  fuel_cost_per_km_unloaded,
  sts_id
) =>
  axios
    .put(api_url(`/vehicles/${vehicle_id}`), {
      registration,
      type,
      capacity,
      disabled,
      fuel_cost_per_km_loaded,
      fuel_cost_per_km_unloaded,
      sts_id,
    })
    .then((res) => res.data);

export const deleteVehicle = async (vehicle_id) =>
  axios.delete(api_url(`/vehicles/${vehicle_id}`)).then((res) => res.data);

///////////////////////// OLD /////////////////////////

export const addDoctorRequest = async (email) =>
  axios.post(api_url("/admin/add-doctor"), { email }).then((res) => res.data);

export const changeUserBannedStatus = async (id, banned) =>
  axios(api_url(`/admin/user/${id}`), {
    method: "PUT",
    data: { banned },
  }).then((res) => res.data);

export const filterAndAnalyze = async (data) =>
  axios.post(api_url("/admin/filter"), data).then((res) => res.data);

export const addUser = async (username, email, password, name, send_email) =>
  axios
    .post(api_url("/users"), { username, email, password, name, send_email })
    .then((res) => res.data);

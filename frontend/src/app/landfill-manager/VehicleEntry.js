import { Typeahead } from "react-bootstrap-typeahead";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { addLandfillEntry, getVehicles } from "../api/landfill";

export const formatDateFromTimestamp = (
  timestamp,
  style = { timeStyle: "short", dateStyle: "short" }
) => {
  if (!timestamp) return "Invalid DateTime";
  return new Intl.DateTimeFormat("en-BD", {
    ...style,
    timeZone: "Asia/Dhaka",
    hourCycle: "h12",
  }).format(new Date(timestamp));
};

export default function VehicleEntry() {
  const [vehicles, setVehicles] = useState([]);
  const [vehicle, setVehicle] = useState(null);
  const [volume, setVolume] = useState(0);
  const [entryTime, setEntryTime] = useState(
    new Date().getTime() + 1000 * 60 * 60 * 6
  );

  useEffect(() => {
    toast.promise(
      getVehicles().then((vehicles) => setVehicles(vehicles)),
      {
        loading: "Loading vehicles...",
        success: "Vehicles loaded!",
        error: "Failed to load vehicles",
      }
    );
  }, []);

  return (
    <div>
      <div className="page-header">
        <h3 className="page-title"> Vehicle Entry </h3>
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <a href="!#" onClick={(event) => event.preventDefault()}>
                Vehicle
              </a>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              Entry
            </li>
          </ol>
        </nav>
      </div>

      <div className="d-flex justify-content-center mb-5">
        <div className="col-md-6">
          <div className="d-flex justify-content-center">
            <Typeahead
              onChange={(selected) => {
                if (selected.length === 0) return;
                setVehicle(selected[0]);
              }}
              options={vehicles.filter(
                (vehicle) => vehicle.done_trip !== vehicle.available_trip
              )}
              labelKey={(option) => `[${option.type}] ${option.registration}`}
              filterBy={["type", "registration"]}
              placeholder="Choose vehicle..."
              className="flex-grow-1"
            />
          </div>
        </div>
      </div>

      {vehicle && (
        <div className="row">
          <div className={`col-md-6 grid-margin stretch-card`}>
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">{vehicle.registration}</h4>
                <p className="card-description">Vehicle Details</p>
                <div className="row">
                  <div className="col-md-6">
                    <p className="text-muted">Type</p>
                    <p>{vehicle.type}</p>
                  </div>
                  <div className="col-md-6">
                    <p className="text-muted">Capacity (Tons)</p>
                    <p>{vehicle.capacity}</p>
                  </div>
                  <div className="col-md-6">
                    <p className="text-muted">Loaded Cost/km</p>
                    <p>{vehicle.fuel_cost_per_km_loaded}</p>
                  </div>
                  <div className="col-md-6">
                    <p className="text-muted">Unloaded Cost/km</p>
                    <p>{vehicle.fuel_cost_per_km_unloaded}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={`col-md-6 grid-margin stretch-card`}>
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">Vehicle Entry</h4>
                <p className="card-description">Add Vehicle entry details</p>
                <div className="row">
                  <div className="col-md-12">
                    <p className="text-muted">Entry Time</p>
                    <p>
                      <input
                        type="datetime-local"
                        className="form-control"
                        value={new Date(entryTime).toISOString().slice(0, 16)}
                        onChange={(e) =>
                          setEntryTime(
                            new Date(e.target.value).getTime() +
                              1000 * 60 * 60 * 6
                          )
                        }
                      />
                    </p>
                  </div>
                  <div className="col-md-12">
                    <p className="text-muted">Volume (Tons)</p>
                    <p>
                      <input
                        type="number"
                        className="form-control"
                        value={volume}
                        onChange={(e) =>
                          setVolume(Number.parseFloat(e.target.value))
                        }
                      />
                    </p>
                  </div>
                  <div className="col-md-6">
                    <p className="text-muted"> </p>
                    <p>
                      <button
                        className="btn btn-primary"
                        onClick={(e) => {
                          e.preventDefault();

                          if (volume <= 0) {
                            toast.error("Volume must be greater than 0");
                            return;
                          } else if (isNaN(volume)) {
                            toast.error("Volume must be a number");
                            return;
                          } else if (volume > vehicle.capacity) {
                            toast.error(
                              "Volume must be less than or equal to vehicle capacity"
                            );
                            return;
                          }

                          toast.promise(
                            addLandfillEntry(
                              vehicle.vehicle_id,
                              entryTime - 1000 * 60 * 60 * 6,
                              volume
                            ).then(() => {
                              toast.success("Entry added successfully");
                              setVehicles(
                                vehicles.map((v) => {
                                  if (v.vehicle_id === vehicle.vehicle_id) {
                                    return {
                                      ...v,
                                      done_trip: v.done_trip + 1,
                                    };
                                  }
                                  return v;
                                })
                              );
                              setVehicle(null);
                            }),
                            {
                              loading: "Adding entry...",
                              success: "Entry added successfully",
                              error: "Failed to add entry",
                            }
                          );
                        }}
                      >
                        Entry
                      </button>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useEffect } from "react";
import { Button, ProgressBar } from "react-bootstrap";
// import {Bar, Doughnut} from 'react-chartjs-2';
import toast from "react-hot-toast";
import {
  GoogleMap,
  useJsApiLoader,
  // Polygon,
  InfoWindow,
  Marker,
} from "@react-google-maps/api";
import Spinner from "../shared/Spinner";
import { getRoutes } from "../api/sts";
import { getSTSofContractor, routeScheduling } from "../api/contractor";

const center = {
  lat: 23.8091,
  lng: 90.3599,
};

const containerStyle = {
  width: "100%",
  height: "100%",
};

function App() {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyBvbT4Izaq1XXNZr5dGEAwZ-K752P9CJ84",
  });

  const [sts, setSts] = React.useState(null);

  const [map, setMap] = React.useState(null);
  const [data, setData] = React.useState([]);
  const [selected, setSelected] = React.useState(null);
  const [route, setRoute] = React.useState(null);

  const [clusters, setClusters] = React.useState([]);

  useEffect(() => {
    toast.promise(
      getSTSofContractor().then((sts) => {
        setSts(sts);
      }),
      {
        loading: "Loading STS...",
        success: "STS loaded!",
        error: "Failed to load STS",
      }
    );
  }, []);

  useEffect(() => {
    if (route && route.direction.length && map) {
      // for each route.directions
      const dir = route.direction.map((d) => ({
        lat: Number.parseFloat(d[1]),
        lng: Number.parseFloat(d[0]),
      }));
      console.log(dir);
      const flightPath = new window.google.maps.Polyline({
        path: dir,
        geodesic: true,
        strokeColor: "#FF0000",
        strokeOpacity: 1.0,
        strokeWeight: 2.5,
      });
      flightPath.setMap(map);
      //   after 5 seconds remove the route
      setTimeout(() => {
        flightPath.setMap(null);
      }, 5000);
    }
  }, [route, map]);

  // useEffect(() => {
  //   toast.promise(
  //     getRoutes().then((routes) => {
  //       const direction = routes.routes.map((r) =>
  //         JSON.parse(r.direction).map((d) => ({
  //           lat: Number.parseFloat(d[1]),
  //           lng: Number.parseFloat(d[0]),
  //         }))
  //       );
  //       console.log(direction);
  //       setRoute({
  //         directions: direction,
  //         landfills: routes.landfills,
  //       });
  //     }),
  //     {
  //       loading: "Loading routes...",
  //       success: "Routes loaded!",
  //       error: "Failed to load routes",
  //     }
  //   );
  // }, []);

  // useEffect(() => {
  //   if (route && map) {
  //     // for each route.directions
  //     for (let i = 0; i < route.directions.length; i++) {
  //       const flightPath = new window.google.maps.Polyline({
  //         path: route.directions[i],
  //         geodesic: true,
  //         strokeColor: "#FF0000",
  //         strokeOpacity: 1.0,
  //         strokeWeight: 2.5,
  //       });
  //       flightPath.setMap(map);
  //     }
  //   }
  // }, [route, map]);

  const onLoad = React.useCallback(function callback(map) {
    const bounds = new window.google.maps.LatLngBounds(center);
    map.fitBounds(bounds);
    setMap(map);
    // map zoom set to 8
  }, []);

  const onUnmount = React.useCallback(function callback(map) {
    setMap(null);
  }, []);

  return (
    <div>
      <div className="page-header">
        <h3 className="page-title">
          <span className="page-title-icon bg-gradient-primary text-white mr-2">
            <i className="mdi mdi-home"></i>
          </span>{" "}
          Collection{" "}
        </h3>
        <nav aria-label="breadcrumb">
          <ul className="breadcrumb">
            <li className="breadcrumb-item active" aria-current="page">
              <span></span>Generate{" "}
              <i className="mdi mdi-alert-circle-outline icon-sm text-primary align-middle"></i>
            </li>
          </ul>
        </nav>
      </div>

      <div className="row">
        <div className="col-md-9">
          <div className="card">
            <div className="card-body">
              <div
                style={{
                  "--aspect-ratio": "16/9",
                }}
              >
                {isLoaded ? (
                  <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={center}
                    zoom={8}
                    yesIWantToUseGoogleMapApiInternals
                    onLoad={onLoad}
                    onUnmount={onUnmount}
                  >
                    {/* {route?.landfills &&
                      route.landfills.map((landfill) => (
                        <Marker
                          key={landfill.id}
                          position={{
                            lat: landfill.latitude,
                            lng: landfill.longitude,
                          }}
                          // onClick={() => {
                          //   setSelected(landfill);
                          // }}
                        >
                          {selected &&
                            selected.latitude === landfill.latitude &&
                            selected.longitude === landfill.longitude && (
                              <InfoWindow
                                onCloseClick={() => {
                                  setSelected(null);
                                }}
                              >
                                <div>
                                  <h2>Landfill</h2>
                                  <p>{landfill.name}</p>
                                </div>
                              </InfoWindow>
                            )}
                        </Marker>
                      ))} */}
                    {data.map((d) => (
                      <Marker
                        key={d.id}
                        position={{
                          lat: d.lat,
                          lng: d.lon,
                        }}
                        // onClick={() => {
                        //   setSelected(d);
                        // }}
                      >
                        {/* {selected &&
                          selected.latitude === d.latitude &&
                          selected.longitude === d.longitude && (
                            <InfoWindow
                              onCloseClick={() => {
                                setSelected(null);
                              }}
                            ></InfoWindow>
                          )} */}
                      </Marker>
                    ))}

                    {sts && (
                      <Marker
                        position={{
                          lat: sts.latitude,
                          lng: sts.longitude,
                        }}
                        onClick={() => {
                          setSelected(sts);
                        }}
                      >
                        {selected &&
                          selected.latitude === sts.latitude &&
                          selected.longitude === sts.longitude && (
                            <InfoWindow
                              onCloseClick={() => {
                                setSelected(null);
                              }}
                            >
                              <div>
                                <h2>STS</h2>
                                <p>{sts.name}</p>
                              </div>
                            </InfoWindow>
                          )}
                      </Marker>
                    )}

                    {/* <PolyGon paths={route} options={{ strokeColor: '#FF0000', fillColor: '#FF000040' }} /> */}
                  </GoogleMap>
                ) : (
                  <Spinner />
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Landfills */}
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              {clusters.length > 0 && (
                <>
                  <h4 className="card-title">Clusters</h4>
                  <hr />
                  <div className="row">
                    {clusters.map((c, i) => (
                      <div className="col-md-12">
                        <p className="text-muted">Cluster {i + 1}</p>
                        <p>
                          {c.locations.map((d) => (
                            <p>
                              {d.lat}, {d.lon}
                            </p>
                          ))}
                        </p>
                        <p>Distance: {c.distance} km</p>
                        {/* <p>Time: {c.duration} seconds</p> */}
                        <p>
                          <button
                            className="btn btn-primary btn-block"
                            onClick={() => {
                              setRoute(c);
                            }}
                          >
                            View Route
                          </button>
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <h4 className="card-title">Locations</h4>
              <hr />
              <div className="row">
                <div className="col-md-12">
                  <p className="text-muted">STS</p>
                  <p>
                    {" "}
                    {sts?.name}
                    <span className="float-right">
                      {/* view button */}
                      <Button
                        variant="outline-primary"
                        className="btn-rounded btn-icon btn-sm"
                        onClick={() => {
                          setSelected(sts);
                        }}
                      >
                        <i className="mdi mdi-eye"></i>
                      </Button>
                    </span>
                  </p>
                </div>

                <hr />

                {data.map((d) => (
                  <div className="col-md-12">
                    <div className="row">
                      <div className="col-md-12">
                        <p className="text-muted">Latitude</p>
                        <p> {d.lat} </p>
                      </div>
                      <div className="col-md-12">
                        <p className="text-muted">Longitude</p>
                        <p> {d.lon} </p>
                      </div>
                      <div className="col-md-12">
                        <p className="text-muted">Weight</p>
                        <p>
                          {" "}
                          <input
                            className="form-control"
                            type="number"
                            value={d.weight}
                            onChange={(e) => {
                              setData(
                                data.map((item) => {
                                  if (
                                    item.lat === d.lat &&
                                    item.lon === d.lon
                                  ) {
                                    return { ...item, weight: e.target.value };
                                  }
                                  return item;
                                })
                              );
                            }}
                          />{" "}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="col-md-12">
                  <button
                    className="btn btn-primary btn-block"
                    onClick={() => {
                      toast.promise(
                        routeScheduling(
                          { lat: sts.latitude, lon: sts.longitude },
                          data
                        ).then((c) => {
                          console.log(c);
                          setClusters(c.routes);
                        }),
                        {
                          loading: "Scheduling...",
                          success: "Scheduling done!",
                          error: "Failed to schedule",
                        }
                      );
                    }}
                  >
                    Generate
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* data as json */}

        <div className="col-md-12 mt-4">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">
                Data
                {/* <span className="float-right">
                  <Button
                    variant="outline-primary"
                    className="btn-rounded btn-icon"
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(data));
                      toast.success("Copied to clipboard");
                    }}
                  >
                    <i className="mdi mdi-content-copy"></i>
                  </Button>
                </span> */}
              </h4>
              <hr />
              <textarea
                className="form-control"
                value={JSON.stringify(data)}
                onChange={(e) => {
                  setData(JSON.parse(e.target.value));
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

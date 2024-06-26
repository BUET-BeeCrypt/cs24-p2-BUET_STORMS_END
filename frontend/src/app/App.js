import axios from "axios";
import { useEffect, useState, createContext } from "react";
import "./App.scss";
import AppRoutes from "./AppRoutes";
import Navbar from "./shared/Navbar";
import Footer from "./shared/Footer";
import { useLocation } from "react-router-dom/cjs/react-router-dom.min";
import { api_url, BASE_URL, FORBIDDEN, UNAUTHORIZED } from "./api";
import { toast } from "react-hot-toast";
import STSManagerSidebar from "./sts-manager/STSManagerSidebar";
import AdminSidebar from "./system-admin/SystemAdminSidebar";
import LandfillManagerSidebar from "./landfill-manager/LandfillManagerSidebar";
import ContractorSidebar from "./contractor-manager/ContractorSidebar";

export const USER_ROLES = {
  SYSTEM_ADMIN: "SYSTEM_ADMIN",
  STS_MANAGER: "STS_MANAGER",
  LANDFILL_MANAGER: "LANDFILL_MANAGER",
  CONTRACTOR_MANAGER: "CONTRACTOR_MANAGER",
  UNASSIGNED: "UNASSIGNED",
};

const sampleUser = {
  username: "admin",
  role: USER_ROLES.SYSTEM_ADMIN,
};

export const UserContext = createContext({
  user: undefined,
  // user: sampleUser,
  setUser: (u) => {},
});
export const UserProvider = UserContext.Provider;

export const parseUserFromJwt = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const rawPayload = JSON.parse(jsonPayload);
    const user = {
      username: rawPayload.username,
      role: rawPayload.role,
    };
    return user;
  } catch (e) {
    return null;
  }
};

function App() {
  const location = useLocation();
  const [isFullPageLayout, setIsFullPageLayout] = useState(false);

  const [user, setUser] = useState(
    parseUserFromJwt(localStorage.getItem("token"))
    // sampleUser
  );

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      console.log("error: ", error);
      if (!error?.request?.responseURL?.includes(BASE_URL))
        return Promise.reject(error);
      const status = error?.response?.status;

      if (api_url("/auth/refresh-token") === error?.response?.config?.url) {
        setUser(null);
        toast.error("Please login again.");
        return new Promise.reject(error);
      }
      // else {
      //   const message = error?.response?.data || "Failed";
      //   toast.error(message);
      // }
      return Promise.reject(error);
    }
  );

  useEffect(() => {
    onRouteChanged(location);
  }, [location]);

  function onRouteChanged(location) {
    window.scrollTo(0, 0);
    const fullPageLayoutRoutes = ["/auth/", "/form/", "/verify"];
    const isFullPageLayout = fullPageLayoutRoutes.some((l) =>
      location.pathname.startsWith(l)
    );
    console.log("isFullPageLayout: ", isFullPageLayout, location.pathname);
    setIsFullPageLayout(isFullPageLayout);

    if (isFullPageLayout) {
      document
        .querySelector(".page-body-wrapper")
        .classList.add("full-page-wrapper");
    } else {
      document
        .querySelector(".page-body-wrapper")
        .classList.remove("full-page-wrapper");
    }
  }

  let navbarComponent = !isFullPageLayout ? <Navbar /> : "";
  let sidebarComponent = !isFullPageLayout ? (
    user?.role === USER_ROLES.STS_MANAGER ? (
      <STSManagerSidebar />
    ) : user?.role === USER_ROLES.SYSTEM_ADMIN ? (
      <AdminSidebar />
    ) : user?.role === USER_ROLES.LANDFILL_MANAGER ? (
      <LandfillManagerSidebar />
    ) : user?.role === USER_ROLES.CONTRACTOR_MANAGER ? (
      <ContractorSidebar />
    ) : null
  ) : (
    ""
  );
  // let SettingsPanelComponent = !isFullPageLayout ? <SettingsPanel /> : "";
  let footerComponent = !isFullPageLayout ? <Footer /> : "";

  return (
    <UserProvider value={{ user: user, setUser }}>
      <div className="container-scroller">
        {navbarComponent}
        <div className={"container-fluid page-body-wrapper"}>
          {sidebarComponent}
          <div className="main-panel">
            <div className="content-wrapper">
              <AppRoutes />
              {/* {SettingsPanelComponent} */}
            </div>
            {footerComponent}
          </div>
        </div>
      </div>
    </UserProvider>
  );
}

export default App;

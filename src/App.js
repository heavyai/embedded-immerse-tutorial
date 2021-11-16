import { useEffect, useState, useRef } from "react";

import "./App.css";

import { EmbeddedContext } from "./EmbeddedContext";

import UIParams from "./ui_params";
import GetParams from "./api-components/GetParams";
import SetParams from "./api-components/SetParams";

import GetFilters from "./api-components/GetFilters";
import SetFilters from "./api-components/SetFilters";

import GetImmerseUIKeys from "./api-components/GetImmerseUIKeys";
import SetImmerseUIKeys from "./api-components/SetImmerseUIKeys";

import AutomaticFilterNotifications from "./api-components/AutomaticFilterNotifications";

import GetExposedAPI from "./api-components/GetExposedAPI";

const Nothing = () => "";

const ApiParts = {
  Nothing,
  GetParams,
  SetParams,
  GetFilters,
  SetFilters,
  GetImmerseUIKeys,
  SetImmerseUIKeys,
  AutomaticFilterNotifications,
  GetExposedAPI,
};

const DEFAULT_IMMERSE_URL =
  "https://localhost.mapd.com:8002/mapd/dashboard/7988";

function App() {
  const iframe = useRef(null);
  // the immerse URL is what we load in our iFrame
  const [immerseURL, setImmerseURL] = useState(DEFAULT_IMMERSE_URL);
  // save a temp URL as the user types.
  const [tempURL, setTempURL] = useState(immerseURL);

  // extract out the immerseHost portion of the immerse URL, so we follow our proper
  // security.
  const [immerseHost, setImmerseHost] = useState("");

  const [APISelection, setAPISelection] = useState("Nothing");
  const APIComponent = ApiParts[APISelection];
  console.log("APIC: ", APIComponent, ApiParts, ApiParts.Nothing);
  useEffect(() => {
    const url = new URL(immerseURL);
    const d = setImmerseHost(`${url.protocol}//${url.host}`);
  }, [immerseURL]);

  return (
    <div className="box">
      <div>
        <div>
          <input
            style={{ width: "600px" }}
            type="text"
            value={tempURL}
            onChange={(e) => setTempURL(e.target.value)}
            onKeyUp={(e) => {
              if (e.key === "Enter" || e.keyCode === 13) {
                setImmerseURL(tempURL);
              }
            }}
          />
          <button
            onClick={() => {
              setImmerseURL(tempURL);
            }}
          >
            Update Immerse URL
          </button>
        </div>
        <iframe
          id="iframe"
          ref={iframe}
          title="immerse"
          width="1000"
          height="1000"
          src={immerseURL}
        />
      </div>
      <div>
        <div>
          <select onChange={(e) => setAPISelection(e.target.value)}>
            <option value="Nothing">-- choose api piece --</option>
            <option value="GetParams">Get Parameters</option>
            <option value="SetParams">Set Params</option>
            <option value="GetFilters">Get Filters</option>
            <option value="SetFilters">Set Filters</option>
            <option value="GetImmerseUIKeys">Get Immerse UI Keys</option>
            <option value="SetImmerseUIKeys">Set Immerse UI Keys</option>
            <option value="AutomaticFilterNotifications">
              Automatic Filter Notifications
            </option>
            <option value="GetExposedAPI">Get Exposed API</option>
          </select>
        </div>
        <div>
          <EmbeddedContext.Provider
            value={{ immerseHost, iframe: iframe.current }}
          >
            <APIComponent />
          </EmbeddedContext.Provider>
        </div>
      </div>
    </div>
  );
}

export default App;

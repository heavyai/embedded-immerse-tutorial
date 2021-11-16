import React, { useEffect, useState } from "react";
import { useEmbeddedContext } from "../EmbeddedContext";

import "../App.css";

const SetParams = () => {
  const [response, setResponse] = useState("");
  const [payload, setPayload] = useState({
    filterType: "SIMPLE",
    dataSource: "mapd_states",
    dataExpression: "abbr",
    dataType: "STR",
    dataTypeIsArray: false,
    operator: "=",
    value: "CA",
  });
  const [payloadString, setPayloadString] = useState(
    JSON.stringify(payload, undefined, 2)
  );
  const [validPayload, setValidPayload] = useState(true);
  const [filterName, setFilterName] = useState("");

  // create an arbitrary responseKey.
  const responseKey = Math.random();

  useEffect(() => {
    // add anEventListener on "message" to listen to the postMessage API.
    // note that these examples will add individual listeners for each possible packet.
    // you can use whatever techniques are easiest for you - switches, dispatch, whatever.

    const listener = (e) => {
      // we're only paying attention to events of type `parameterValuesResponse`
      // AND only look at the responses that match our `responseKey`. This ensures we
      // do not listen to other posts from other parts of our app.
      if (
        e.data.type === "globalFilterResponse" &&
        e.data.responseKey === responseKey
      ) {
        setResponse(e.data);
      }
    };

    // add our listener
    window.addEventListener("message", listener);
    // and remove it when we unmount
    return () => {
      window.removeEventListener("message", listener);
    };
  });

  const { immerseHost, iframe } = useEmbeddedContext();
  return (
    <div>
      <div className="code">{JSON.stringify(response, undefined, 2)}</div>
      <div>
        <input
          type="text"
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
        />
      </div>
      <div>
        <div>Input payload:</div>
        <div>
          <textarea
            style={{ backgroundColor: validPayload ? "white" : "#FFCCCC" }}
            id="json"
            cols="50"
            rows="20"
            onChange={(e) => {
              const newPayloadString = e.target.value;
              try {
                setPayloadString(newPayloadString);
                const newPayload =
                  newPayloadString.length === 0
                    ? undefined
                    : JSON.parse(newPayloadString);
                setPayload(newPayload);
                setValidPayload(true);
              } catch (e) {
                setValidPayload(false);
              }
            }}
            value={payloadString}
          ></textarea>
        </div>
      </div>
      <button
        onClick={() => {
          setResponse("");
          iframe.contentWindow.postMessage(
            {
              type: "setGlobalFilter",
              responseKey,
              payload: { filter: payload, name: filterName },
            },
            immerseHost
          );
        }}
      >
        Set Global Filters
      </button>
    </div>
  );
};

export default SetParams;

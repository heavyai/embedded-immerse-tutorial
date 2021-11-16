import React, { useEffect, useState } from "react";
import { useEmbeddedContext } from "../EmbeddedContext";

import "../App.css";

const SetParams = () => {
  const [response, setResponse] = useState("");
  const [payload, setPayload] = useState({ SampleParam: "New External Value" });
  const [payloadString, setPayloadString] = useState(
    JSON.stringify(payload, undefined, 2)
  );
  const [validPayload, setValidPayload] = useState(true);

  const [key, setKey] = useState("");
  const [value, setValue] = useState(true);

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
      console.log("LISTENS : ", e);
      if (
        (e.data.type === "setImmerseUIKeyComplete" ||
          e.data.type === "enableAllImmerseUIKeysComplete" ||
          e.data.type === "disableAllImmerseUIKeysComplete") &&
        e.data.responseKey === responseKey
      ) {
        setResponse("SUCCESS");
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
      <div>{response}</div>
      <div>
        <div>
          Key name:
          <input
            type="text"
            value={key}
            onChange={(e) => setKey(e.target.value)}
          />
        </div>
        <div>
          Key value:
          <select onChange={(e) => setValue(e.target.value)} value={value}>
            <option value={true}>true</option>
            <option value={false}>false</option>
          </select>
        </div>
      </div>
      <button
        onClick={() => {
          setResponse("");
          iframe.contentWindow.postMessage(
            {
              type: "setImmerseUIKey",
              responseKey,
              payload: { uiKey: key, value: value === "true" ? true : false },
            },
            immerseHost
          );
        }}
      >
        Set Individual Key
      </button>
      <button
        onClick={() => {
          setResponse("");
          iframe.contentWindow.postMessage(
            {
              type: "enableAllImmerseUIKeys",
              responseKey,
            },
            immerseHost
          );
        }}
      >
        Enable all UI Keys
      </button>
      <button
        onClick={() => {
          setResponse("");
          iframe.contentWindow.postMessage(
            {
              type: "disableAllImmerseUIKeys",
              responseKey,
            },
            immerseHost
          );
        }}
      >
        Disable all UI Keys
      </button>
    </div>
  );
};

export default SetParams;

import React, { useEffect, useState } from "react";
import { useEmbeddedContext } from "../EmbeddedContext";

import "../App.css";

const GetParams = () => {
  const [parameters, setParameters] = useState("");

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
        e.data.type === "parameterValuesResponse" &&
        e.data.responseKey === responseKey
      ) {
        setParameters(e.data.payload);
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
      <div className="code">{JSON.stringify(parameters, undefined, 2)}</div>
      <button
        onClick={() => {
          iframe.contentWindow.postMessage(
            {
              type: "getParameterValues",
              responseKey,
            },
            immerseHost
          );
        }}
      >
        Extract parameters
      </button>
    </div>
  );
};

export default GetParams;

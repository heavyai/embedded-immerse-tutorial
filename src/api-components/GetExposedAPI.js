import React, { useEffect, useState } from "react";
import { useEmbeddedContext } from "../EmbeddedContext";

import "../App.css";

const GetParams = () => {
  const [payload, setPayload] = useState("");

  // create an arbitrary responseKey.
  const responseKey = Math.random();

  useEffect(() => {
    // add anEventListener on "message" to listen to the postMessage API.
    // note that these examples will add individual listeners for each possible packet.
    // you can use whatever techniques are easiest for you - switches, dispatch, whatever.

    const listener = (e) => {
      console.log("LISTENS : ", e);
      // we're only paying attention to events of type `parameterValuesResponse`
      // AND only look at the responses that match our `responseKey`. This ensures we
      // do not listen to other posts from other parts of our app.
      //
      // note that each registered responseKey will get a message -once- after -each- filter
      // change. If you're ignoring the responseKey, then you could get multiple responses
      // if there have been multiple registrations.
      if (e.data.type === "exposedAPI" && e.data.responseKey === responseKey) {
        setPayload(e.data.payload);
      }
    };

    // add our listener
    window.addEventListener("message", listener);

    // and actually register for filter notifications.
    iframe.contentWindow.postMessage(
      {
        type: "getExposedAPI",
        responseKey,
      },
      immerseHost
    );

    // and remove it when we unmount
    return () => {
      window.removeEventListener("message", listener);
    };
  });

  const { immerseHost, iframe } = useEmbeddedContext();
  return (
    <div>
      <div className="code">{JSON.stringify(payload, undefined, 2)}</div>
    </div>
  );
};

export default GetParams;

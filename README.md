# So you wanna embed Immerse?

Okay, you need a few things to start with:

- An Immerse instance > 5.8 (and you'll need to configure a few things)
- An app to embed Immerse into.
- Knowledge of the API.
- Knowledge of HTML and JavaScript, especially how to set up an iframe. There is no requirement that Immerse is embedded into any particular type of app - React, Angular, or plain vanilla javacript are all acceptable options.

## Configuring Immerse

Out of the box, Immerse _will_ allow embedding into an iframe, but _will not_ allow communication between Immerse and the parent app. You'll need to turn on some options there - there are two choices.

You can allow communication between Immerse and _any_ external application that gets ahold of a reference to the Immerse window. This should **not** be used in production, since this is a major security hole. But for development setups where you're sure your Immerse is otherwise secure? It can help speed things up.

You can allow communication between Immerse and only specific URLs. This way Immerse will only send/receive information from known valid sources and will still refuse to talk to anything else. This **is** safe for production use.

### Allowing access from anywhere. (only for dev, aka "The Wrong Way")

In your servers.json file, add the following:

```
"feature_flags" : { "dev/embedded_api_security" : false }
```

If you already have a `feature_flags` section in your servers.json, just add the key to it. This will allow Immerse to talk to any external site that is able to get ahold of its containing window. This is useful for debugging purposes when you're not sure what your final URL will be, or if multiple different developers are building an app against the same Immerse instance.

### Allowing access from specific sites (dev or prod, aka "The Right Way")

In your servers.json file, add the following:

```
"event_origins" : ["https://somesite.com:8888", "https://other.somesite.com:9544"]
```

For your specific instance, replace the domains with the domains you want to communicate with. Please note - we need complete information - so specify the protocol, server, and port.

e.g., if you want Immerse to talk to an app hosted at demo.omnisci.com, running on port 9543, which is insecure, you'd add this:

```
event_origins : ["http://demo.omnisci.com:9543"]
```

You may need to restart Immerse after adding in any of these options, and you will definitely need to reload any existing Immerse pages for the changes to take effect.

Before we move on, remember - **don't leave the `dev_embedded_api_security` flag set to false**. Write yourself a note, use a separate dev Immerse install, or hardwire it to only the URL used on your local dev machine. But don't forget to leave it off.

# Initial embedded app setup.

This document will help build out the tutorial app that is contained within the repo. Some sections you will be able to enable yourself, some sections will require you to type or change something. If you'd rather start building your own app from scratch, or want to configure this app on the fly to better suit your needs, please feel free.

This tutorial app was built with the standard available `create-react-app` tool and assumes a knowledge of React app components. But, again, React itself is not specifically required to communicate with Immerse. So if you'd rather just pick out the pieces of API communication and use those, that's all you need.

To start this app, do:

- `npm ci`
- `npm start`

If you want to run it in secure mode, do:

- `HTTPS=true npm start`

If you have an ssh cert to use (which will probably be required to ensure communication when `embedded_api_security` is turned off), start as follows:

- `HTTPS=true SSL_CRT_FILE=/path/to/SECURITY.cer.pem SSL_KEY_FILE=/path/to/KEYFILE.key.pem npm start`

And you're up and running!

The standard app harness consists of two items: an input box at the top to allow you to set/change your Immerse URL, and an iframe which contains your immerse instance itself. Please change the `DEFAULT_IMMERSE_URL` at the top of App.js to point to your standard install point to save yourself some trouble.

The iframe which embeds immerse is very standard:

```
<iframe
  id="iframe"
  ref={iframe}
  title="immerse"
  width="1000"
  height="1000"
  src={immerseURL}
/>
```

You can set any other attributes you need on the iframe, and of course the width/height is arbitrary. The `ref` is a bit of React specific syntax which lets us hang onto the reference to the iframe involved. It is the equivalent of :

`document.getElementById('iframe')`

(because we assigned this iframe an id of 'iframe')

Again, access the iframe in whatever manner is most useful.

# Adding a parameter to Immerse.

For tutorial purposes, it will probably be easiest to start with a fresh dashboard.

Inside of Immerse, add a parameter to your dashboard - name it `SampleParam`, give it a type of `Custom`, and then a value of `embedded immerse param value`. You can save this dashboard so you can refer back to it as we go along.

# Access parameters externally.

Immerse exposes an API which uses `postMessage` requests, which require JSON packets of information describing what you want. The information will be posted back to your application, which can be picked up by a message handler.

To get a parameter, we need to send this packet:

```
iframe.contentWindow.postMessage(
  {
    type: "getParameterValues",
    responseKey,
  },
  immerseHost
);
```

Let's break this down. `postMessage` is called on the window we're sending to, in this case it's the `contentWindow` of our embedded `iframe`. The first argument is the message (which is our JSON packet), and the second argument is the targetOrigin, which is what the `origin` of the target must be.

The `targetOrigin` should always match our immerse host URL. This way we won't risk leaking information - say the user navigated away from immerse inside of the iframe to `black-hat-hackers.com`. We could then send internal information to that external site. But by setting the `targetOrigin` to our immerse URL, nothing will be delivered if the user has navigated.

The key components of the json packet are as follows:

- `type` the type of request we want to send to Immerse. In this case, we are sending `getParameterValues`
- `responseKey` - an arbitrary value that will be handed back to us in the response. This is used to pair up requests with responses - your app may send off many requests in rapid sequence, and by matching up response keys, we can ensure the response is delivered back to the proper target.
- `payload` - contains information to hand in with the request. A `getParameterValues` request has no payload.

The message event listener we attached to our window will get back an `event`, which has a `data` attribute. This will be an object with the following values:

```
{
  type : "parameterValuesResponse",
  responseKey : /* the same responseKey we handed in */
  data : {
    /* a json object of key/value parameter pairs
  }
}
```

To see this in action, choose the `Get Parameters` option from the drop down, and click `Extract parameters`. You'll see that the params defined in Immerse are pulled into your app and stringified for display.

Things to try:

- add a new parameter to Immerse and extract it.
- change the value of a parameter in Immerse and extract it.
- delete a parameter from Immerse and extract it.
- Add a new tab, then give the parameter a new value on that tab. Extract the value on either tab and note that it changes.

# Set parameters externally.

Of course, merely being able to read a parameter is of limited utility. We also need to be able to set them. Here's the call for that:

```
iframe.contentWindow.postMessage(
  {
    type: "setParameterValues",
    responseKey,
    payload : newParametersObject
  },
  immerseHost
);
```

`newParametersObject` should be an object containing our new values. For this tutorial, with our `SampleParam`, if we want to set it to `New External Value`, our call is:

```
iframe.contentWindow.postMessage(
  {
    type: "setParameterValues",
    responseKey,
    payload : {SampleParam : 'New External Value'}
  },
  immerseHost
);
```

This call will return a message with type `setParameterValuesComplete`

To see this in action, choose the `Set Parameters` option from the drop down, change the JSON value, and click `Set parameters`. In Immerse, open the parameters tab and you will see the new values appear.

Things to try:

- you can set more than one parameter in the payload object.
- You **cannot** create parameters via the external API. non-existent parameters which are passed in will be discarded.
- If a parameter value is linked, it will be updated on all tabs. If it is unlinked, it'll only be on the current tab.
- Try creating a chart that uses a param in some manner - either consumed in a filter, or a column parameter. Change the parameter externally.
- There is very little validation which occurs here (for now), so please be careful about the possible values you pass in - you could force Immerse into an invalid state. For example, by setting a string value on a numeric parameter.

# Access filters externally.

Next. Let's pull out filter information. Add a new table chart to Immerse, and let's start with the `mapd_states` table. Add a single dimension of `abbr`.

Switch to the `Get Filters` component from the dropdown, and click on `Extract Filters`

You'll see the JSON response is an empty array, because we haven't created any filters.

Click on a state, let's use `CA` for our example. Open the filter tab, and you'll see that the filter is there, from the chart.

Back in our app wrapper, click `Extract Filters` again and you'll see the structure of the filter object, as an element in the array.

The API call is:

```
iframe.contentWindow.postMessage(
  {
    type: "getFilters",
    responseKey,
  },
  immerseHost
);
```

And the response will have `type` of `filters`, and a payload with an array of filter objects.

Things to try:

- add a global filter and observe the results.
- Select additional rows in the table to expand the filter, and observe the results.

Of note - there is not currently a way to distinguish between a global filter and a crossfilter filter.

Of note - the filter structure is arguably more complicated than it needs to be. For now, the recommendation is to contruct a filter that is similar to what you want to create in Immerse, then edit the response JSON to set a filter you want.

# Set filters externally.

Please note that you can only set **global filters** via the external API at this time. The message format is as follows:

```
iframe.contentWindow.postMessage(
  {
    type: "setGlobalFilter",
    responseKey,
    payload: { filter, name: filterName },
  },
  immerseHost
);
```

The `filter` part of the payload is an object of the format returned by `getFilters`. This is not yet very well documented.

The `name` refers to the name of the global filter you will create, which can also be accessed later. To clear a filter, send in the same name, but an empty `filter` value.

Of note - you cannot edit or delete a filter which was not created via the external API.

Setting a filter does not yet return a response, but _should_ return one of `globalFilterResponse`.

# Read state of Immerse UI

The Immerse UI is configurable, to allow certain parts of the UI to be turned off or on. To start with, lets read the current state of the Immerse UI:

```
iframe.contentWindow.postMessage(
  {
    type: "getImmerseUIKeys",
    responseKey,
  },
  immerseHost
);
```

This will return a JSON package with:
`type` : immerseUIKeysResponse
`payload` : will contain an object mapping an Immerse UI key to true/false, depending upon whether it is currently enabled.

# Set state of Immerse UI

To configure the Immerse UI, 3 different messages are exposed:

```
iframe.contentWindow.postMessage(
  {
    type: "setImmerseUIKeys",
    responseKey,
    payload : {
      uiKey : `NAME_OF_KEY_FROM_GET_IMMERSE_UI_KEYS`,
      value : true / false (note - boolean true/false, not strings)
    }
  },
  immerseHost
);
```

This will return a JSON package with:
`type` : setImmerseUIKeyComplete
`payload` : will contain an object mapping an Immerse UI key to true/false, depending upon whether it is currently enabled.

You can also enable/disable all values:

```
iframe.contentWindow.postMessage(
  {
    type: "enableAllImmerseUIKeys",
    responseKey,
  },
  immerseHost
);
```

```
iframe.contentWindow.postMessage(
  {
    type: "disableAllImmerseUIKeys",
    responseKey,
  },
  immerseHost
);
```

which will return events with data.type of `enableAllImmerseUIKeysComplete` or `disableAllImmerseUIKeysComplete`, respectively.

**Of note** - As of 5.10, These values can also be configured in your `servers.json` file by setting
`immerse_ui_keys.` The value is as follows:

- `immerse_ui_keys` : `ALL` - everything enabled.
- `immerse_ui_keys` : `NONE` - everything enabled.
-

```
`immerse_ui_keys` : {
  `default` : ALL|NONE,
  ui_on: [array of keys to enable],
  ui_off : [array of keys to disable]
}
```

There is also `immerse_ui_embed_keys` to customize display of Immerse when it is running embedded with an iFrame. Use of the key values in servers.json can spare you from needing to set the values you want in your individual app, but you always have the option to do it, perhaps to customize further.

# Automatic filter notifications

So far, we have needed to explicitly pull information from Immerse when a change happens. But we can also receive filter information on a push basis. To do that, send in a `registerForFilterNotifications` call:

```
iframe.contentWindow.postMessage(
  {
    type: "registerForFilterNotifications",
    responseKey,
  },
  immerseHost
);
```

When you are done, you should clean it up with:

```
iframe.contentWindow.postMessage(
  {
    type: "unregisterForFilterNotifications",
    responseKey,
  },
  immerseHost
);
```

You will get back an event with a `data.type` of either `registerForFilterNotificationsResponse` or `unregisterForFilterNotificationsResponse`, respectively. Once you have registered for notifications, you will receive them automatically in your wrapping app whenever the user changes filters.

# Full API.

You can also programmatically retrieve the full API:

```
iframe.contentWindow.postMessage(
  {
    type: "getExposedAPI",
    responseKey,
  },
  immerseHost
);
```

This will return a JSON blob with information about the messages to send, the payload required, and the return type.

---

That's it for now.

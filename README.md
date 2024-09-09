# EdgeSync360 EdgeHub Node.js SDK Example

## Overview

This Node.js script demonstrates how to use the EdgeSync360 EdgeHub NodeJS SDK to configure and interact with an edge device. The script initializes the EdgeAgent, sets up device and tag configurations, and handles incoming messages from the device.

## Requirements

-   Node.js

-   `edgesync360-edgehub-edge-nodejs-sdk` package

## Setup

1. **Install Dependencies**
   Ensure you have Node.js installed. Install the required package using npm:
   
   ```sh
   npm install edgesync360-edgehub-edge-nodejs-sdk
   ```

2. **Configuration**
   Modify the script to include your credentials and configurations:

-   `credentialKey`: Your credential key.

-   `APIUrl`: The URL of your API endpoint.

-   `nodeId`: The ID of your node (obtain from the DataHub portal).

-   `deviceId`: The ID of your device (if the edge type is Device).

-   `ovpnPath`: Path to the `.ovpn` file, if using OpenVPN.

```js
let options = {
	connectType: edgeSDK.constant.connectType.DCCS,
	DCCS: {
		credentialKey: "YOUR_CREDENTIAL_KEY",
		APIUrl: "YOUR_API_URL",
	},
	useSecure: false,
	autoReconnect: true,
	reconnectInterval: 1000,
	nodeId: "YOUR_NODE_ID",
	type: edgeSDK.constant.edgeType.Gateway,
	deviceId: "Device1",
	heartbeat: 60000,
	dataRecover: true,
	ovpnPath: "",
};
```

3. **Script Details**

-   **Initialization** : Sets up the `EdgeAgent` with the provided options.

-   **Event Listeners** :

    -   `connected`: Logs a success message and uploads configuration to the edge device.
    -   `disconnected`: Logs when the connection is lost.
    -   `messageReceived`: Handles incoming messages based on their type (write values or configuration acknowledgment).

-   **Configuration Upload** : Defines and uploads configuration for devices and tags.

## Usage

Run the script using Node.js:

```sh
node index.js
```

## Code Breakdown

1. **EdgeAgent Initialization** :

```js
let edgeAgent = new edgeSDK.EdgeAgent(options);
```

2. **Event Handling** :

-   **Connection** :

```js
edgeAgent.events.on("connected", () => { ... });
```

-   **Disconnection** :

```js
edgeAgent.events.on("disconnected", () => { ... });
```

-   **Message Reception** :

```js
edgeAgent.events.on("messageReceived", (msg) => { ... });
```

3. **Configuration Setup** :

-   **Device Configuration** :

```js
let deviceConfig = new edgeSDK.DeviceConfig();
```

-   **Tag Configuration** :

```js
let analogTagConfig = new edgeSDK.AnalogTagConfig();
let discreteTagConfig = new edgeSDK.DiscreteTagConfig();
let textTagConfig = new edgeSDK.TextTagConfig();
```

4. **Upload Configuration** :

```js
edgeAgent.uploadConfig(edgeSDK.constant.actionType.delsert, edgeConfig);
```

## Troubleshooting

-   **Connection Issues** : Ensure your `credentialKey`, `APIUrl`, and `nodeId` are correct.

-   **Configuration Upload Errors** : Check the console for detailed error messages.

-   **Message Handling** : Verify the structure of incoming messages and adapt the handling logic if needed.

const edgeSDK = require("edgesync360-edgehub-edge-nodejs-sdk");

let options = {
	connectType: edgeSDK.constant.connectType.DCCS,
	DCCS: {
		// If ConnectType is DCCS, the following options must be entered
		credentialKey: "YOUR_CREDENTIAL_KEY",
		APIUrl: "YOUR_API_URL",
	},
	useSecure: false,
	autoReconnect: true,
	reconnectInterval: 1000,
	nodeId: "YOUR_NODE_ID", // getting from datahub portal
	type: edgeSDK.constant.edgeType.Gateway, // Configure the edge as a Gateway or Device. The default setting is Gateway.
	deviceId: "Device1", // If the type is Device, the DeviceID must be input.
	heartbeat: 60000, // The default is 60 seconds.
	dataRecover: true, // Whether to recover data when disconnected
	ovpnPath: "", // Set the path of the .ovpn file.
};

let edgeAgent = new edgeSDK.EdgeAgent(options);

edgeAgent.events.on("connected", () => {
	console.log("Connection success!");
	let edgeConfig = new edgeSDK.EdgeConfig();

	// set node config
	let nodeConfig = new edgeSDK.NodeConfig();

	// set device config
	let deviceConfig = new edgeSDK.DeviceConfig();

	deviceConfig.id = "Device1";
	deviceConfig.name = "Device 1";
	deviceConfig.type = "Smart Device";
	deviceConfig.description = "Device 1";

	// set tag config
	let analogTagConfig = new edgeSDK.AnalogTagConfig();
	analogTagConfig.name = "ATag1";
	analogTagConfig.description = "ATag1";
	analogTagConfig.readOnly = false;
	analogTagConfig.arraySize = 0;
	analogTagConfig.spanHigh = 1000;
	analogTagConfig.spanLow = 0;
	analogTagConfig.engineerUnit = "";
	analogTagConfig.integerDisplayFormat = 4;
	analogTagConfig.fractionDisplayFormat = 2;

	let discreteTagConfig = new edgeSDK.DiscreteTagConfig();
	discreteTagConfig.name = "DTag1";
	discreteTagConfig.description = "DTag1";
	discreteTagConfig.arraySize = 0;
	discreteTagConfig.state0 = "0";
	discreteTagConfig.state1 = "1";

	let textTagConfig = new edgeSDK.TextTagConfig();
	textTagConfig.name = "TTag1";
	textTagConfig.description = "TTag1";
	textTagConfig.readyOnly = false;
	textTagConfig.arraySize = 0;

	let blockConfig = new edgeSDK.BlockConfig();
	blockConfig.blockType = "Pump";
	blockConfig.analogTagList.push(analogTagConfig);
	blockConfig.discreteTagList.push(discreteTagConfig);
	blockConfig.textTagList.push(textTagConfig);

	deviceConfig.addBlock("Pump01", blockConfig);
	deviceConfig.addBlock("Pump02", blockConfig);

	nodeConfig.deviceList.push(deviceConfig);
	edgeConfig.node = nodeConfig;
	console.log("upload config");

	edgeAgent.uploadConfig(edgeSDK.constant.actionType.delsert, edgeConfig);
});
edgeAgent.events.on("disconnected", () => {
	console.log("Disconnected...");
});
edgeAgent.events.on("messageReceived", (msg) => {
	switch (msg.type) {
		case edgeSDK.constant.messageType.writeValue:
			for (let device of msg.message.deviceList) {
				console.log("DeviceID:" + device.ID);
				for (let tag of device.tagList) {
					console.log("TagName:" + tag.name + "Value:" + tag.value);
				}
			}
			break;
		case edgeSDK.constant.messageType.configAck:
			console.log("Upload Config Result:" + msg.message);
			break;
	}
});

edgeAgent.connect((error, result) => {});

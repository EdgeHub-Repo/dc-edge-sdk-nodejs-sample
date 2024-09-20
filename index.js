const edgeSDK = require("edgesync360-edgehub-edge-nodejs-sdk");

/**
 * @type {EdgeAgentOptions}
 */
let options = {
	connectType: edgeSDK.constant.connectType.AzureIotHub,
	AzureIotHub: {
		hostName: "YOUR_HOST_NAME",
		sasToken: "YOUR_SAS_TOKEN",
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

const edgeAgent = new edgeSDK.EdgeAgent(options);
let configAcked = false;

edgeAgent.events.on("connected", () => {
	console.log("Connection success!");
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
			configAcked = true;
			break;
	}
});

edgeAgent.connect(async (error, result) => {
	if (error) {
		console.log(`connect failed, err: ${err}`);
		return;
	}

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
	await edgeAgent.uploadConfig(edgeSDK.constant.actionType.delsert, edgeConfig);

	while (!configAcked) {
		console.log("waiting for config to ack ...");
		await sleep(1000);
	}

	for (let i = 0; i < 10; i++) {
		let data = new edgeSDK.EdgeData();
		edgeConfig.node.deviceList.map((device) => {
			device.analogTagList.map((tag) => {
				let aTag = new edgeSDK.EdgeDataTag();
				aTag.deviceId = "Device1";
				aTag.tagName = tag.name;
				aTag.value = Math.floor(Math.random() * 100) + 1;
				data.tagList.push(aTag);
			});

			device.discreteTagList.map((tag) => {
				let dTag = new edgeSDK.EdgeDataTag();
				dTag.deviceId = "Device1";
				dTag.tagName = tag.name;
				dTag.value = (Math.random() * 100) % 2;
				data.tagList.push(dTag);
			});

			device.textTagList.map((tag) => {
				let tTag = new edgeSDK.EdgeDataTag();
				tTag.deviceId = "Device1";
				tTag.tagName = tag.name;
				tTag.value = "TEST" + Math.random().toString();
				data.tagList.push(tTag);
			});
		});

		await edgeAgent.sendData(data, (err, result) => {
			if (err) {
				console.log(`send data ${i} failed, err: ${err}`);
			} else {
				console.log(`send data ${i} success`);
			}
		});

		await sleep(1000);
	}

	await edgeAgent.disconnect();
});

async function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

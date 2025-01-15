import { v4 as uuidv4 } from 'uuid';

export const searchFlow_2Structure = (templateName, customerPhone, notification) => {
	// Generate a flow token && parameters to identify the flow among others
	let flowToken;
	let components;
	let language;

	if (templateName === process.env.FLOW_2) {
		flowToken = `2${uuidv4()}`;
		components = [			
			{
				type: "header",
				parameters: [
					{
						type: "text",
						text: customerPhone,
					},
				],
			},
			{
				type: "body",
				parameters: [
					{
						type: "text",
						text: notification,
					},
				],
			},
			{
				type: "BUTTON",
				sub_type: "flow",
				index: "0",
				parameters: [{ type: "action", action: { flow_token: flowToken } }],
			},
		];

		language = "es";

		return { components, language, flowToken };
	} else {
		console.log("Cannot find template in searchFlowStructure.js");
		return;
	}
};
import { v4 as uuidv4 } from "uuid";

export const searchFlow_2Structure = (myLead) => {
	// Generate a flow token && parameters to identify the flow among others
	let flowToken;
	let components;
	let language;

	flowToken = `2${uuidv4()}`;
	components = [
		/* {
				type: "header",
				parameters: [
					{
						type: "text",
						text: customerPhone,
					},
				],
			}, */
		{
			type: "body",
			parameters: [
				{
					type: "text",
					text: myLead,
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

	return { components, language };
};


export const searchFlow_2Structure = (myLead, flow_2Token) => {
	let components;
	let language;
		
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
			parameters: [{ type: "action", action: { flow_token: flow_2Token } }],
		},
	];

	language = "es";

	return { components, language };
};

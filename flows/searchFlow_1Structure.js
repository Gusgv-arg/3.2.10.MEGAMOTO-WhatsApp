
// Searches Flow structure to return format por post request
export const searchFlow_1Structure = (templateName) => {
	
	// Generate a flow token && parameters to identify the flow among others
	const flowToken = 1;
	
	const components = [
		{
			type: "header",
			parameters: [
				{
					type: "image",
					image: {
						link: "https://github.com/Gusgv-arg/3.2.10.MEGAMOTO-Campania-WhatsApp/blob/main/assets/foto_campa%C3%B1a_pedidosya.jpg?raw=true",
					},
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

	const language = "es";

	return { components, language };
};

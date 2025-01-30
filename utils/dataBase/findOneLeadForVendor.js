// Función que toma el lead mas viejo o el que tiene toContact mas viejo y lo devuelve
// A futuro hay que modificarla para que priorize x el índice entre stock, antiguedad, etc
export const findOneLeadForVendor = (availableLeads) => {
	const lead = availableLeads.reduce((oldest, current) => {
		if (!oldest) return current;

		const currentDate = Date.parse(current.lastFlow.flowDate.replace(",", ""));
		const oldestDate = Date.parse(oldest.lastFlow.flowDate.replace(",", ""));

		return currentDate < oldestDate ? current : oldest;
	}, null);

	const lastFlow = lead.lastFlow;
	console.log("lead:", lead);
	console.log("lastFlow:", lastFlow);
	console.log("lastFlowOtherproducts:", lastFlow.otherProducts);

	const myLead = `Fecha: ${
		lastFlow.toContact ? lastFlow.toContact : lastFlow.flowDate
	}. Nombre: ${lead.name}. Celular: ${lead.id_user}. Status: ${
		lastFlow.client_status
	}. Marca: ${lastFlow.brand ? lastFlow.brand : "No sabe"}. Modelo: ${
		lastFlow.model ? lastFlow.model : "No sabe"
	}. Precio Informado: ${
		lastFlow.price ? lastFlow.price : "No informado"
	}.${lastFlow.otherProducts && lastFlow.otherProducts.trim() !== "" ? lastFlow.otherProducts : ""} Preguntas: ${
		lastFlow.questions ? lastFlow.questions : ""
	}. Método de Pago: ${lastFlow.payment}. ${lastFlow.questions ? "Preguntas: " `${lastFlow.questions}` : ""}`;

	const flow_2Token = lastFlow.flow_2token;
	
	return { myLead, flow_2Token };
};

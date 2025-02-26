// Función que toma el lead mas viejo o el que tiene toContact mas viejo y lo devuelve
// A futuro hay que modificarla para que priorize x el índice entre stock, antiguedad, etc
export const findOneLeadForVendor = (availableLeads) => {
	const lead = availableLeads.reduce((selectedLead, current) => {
		if (!selectedLead) return current;

		// Verificar si el modelo actual tiene prioridad
		if (current.prioridad && typeof current.prioridad === "number") {
			// Si el lead seleccionado no tiene prioridad, seleccionamos el actual
			if (
				!selectedLead.prioridad ||
				typeof selectedLead.prioridad !== "number"
			) {
				return current;
			}
			// Comparar prioridades
			return current.prioridad < selectedLead.prioridad
				? current
				: selectedLead;
		}

		const currentDate = Date.parse(current.lastFlow.flowDate.replace(",", ""));
		const oldestDate = Date.parse(
			selectedLead.lastFlow.flowDate.replace(",", "")
		);

		return currentDate < oldestDate ? current : selectedLead;
	}, null);

	const lastFlow = lead.lastFlow;
	//console.log("lastFlow:", lastFlow);

	const myLead = `Fecha: ${
		lastFlow.toContact ? lastFlow.toContact : lastFlow.flowDate
	}Nombre: ${lead.name}. Celular: ${lead.id_user}. Status: ${
		lastFlow.client_status
	}. Marca: ${lastFlow.brand ? lastFlow.brand : "No sabe"}. Modelo: ${
		lastFlow.model ? lastFlow.model : "No sabe"
	}. Precio Informado: ${lastFlow.price ? lastFlow.price : "No informado"}. ${
		lastFlow.otherProducts ? lastFlow.otherProducts : ""
	} Método de Pago: ${
		lastFlow.payment ? lastFlow.payment : "No informado"
	}. DNI: ${lastFlow.dni ? lastFlow.dni : "No informado"}. Crédito: $ ${
		lastFlow.credit ? lastFlow.credit : "Sin info."
	}. Preguntas: ${lastFlow.questions ? lastFlow.questions : "Sin preguntas"}.`
		.replace(/\n/g, " ")
		.replace(/ {2,}/g, " ");

	const flow_2Token = lastFlow.flow_2token;

	return { myLead, flow_2Token };
};

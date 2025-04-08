import xlsx from "xlsx";
import Leads from "../../models/leads.js";
import { adminWhatsAppNotification } from "../notifications/adminWhatsAppNotification.js";
import { handleWhatsappMessage } from "../whatsapp/handleWhatsappMessage.js";
import { v4 as uuidv4 } from "uuid";

// Importar los enums desde el esquema de Leads
const validClientStatuses = Leads.schema.path("flows.client_status").enumValues;
const validBrands = Leads.schema.path("flows.brand").enumValues;

// Definir los encabezados esperados en el Excel
const expectedHeaders = [
	"Nombre",
	"Teléfono",
	"Estado",
	"Primer Contacto",
	"Fecha a Contactar",
	"Mensajes",
	"Marca",
	"Modelo",
	"Precio informado",
	"Otros Modelos",
	"Forma de Pago",
	"DNI",
	"Crédito",
	"Preguntas del Lead",
	"Vendedor",
	"Notas del Vendedor",
	"Historial",
	"Orígen",
	"Token Flow 2",
	"Error",
];

// Array de vendedores con sus teléfonos
const vendors = [
	{ name: "Gustavo_Glunz", phone: process.env.PHONE_GUSTAVO_GLUNZ },
	{
		name: "Gustavo_GV",
		phone: process.env.PHONE_GUSTAVO_GOMEZ_VILLAFANE,
	},
];

// Función para transformar strings sin acento a con acento
const transformToAccented = (status) => {
	if (status === "" || status === undefined || status === null) {
		status = "vendedor";
	}
	const transformations = {
		compro: "compró",
		"no compro": "no compró",
		"sin definicion": "sin definición",
		"sin definir": "sin definición",
	};

	return transformations[status.toLowerCase()] || status;
};

export const processExcelToChangeLeads = async (
	excelBuffer,
	userPhone,
	vendorName
) => {
	try {
		const workbook = xlsx.read(excelBuffer, { type: "buffer" });
		const sheet = workbook.Sheets[workbook.SheetNames[0]];
		const data = xlsx.utils.sheet_to_json(sheet, {
			header: 1,
			blankrows: false,
			defval: "",
		});

		// Validar estructura del Excel
		const headers = data[0];
		for (let i = 0; i < expectedHeaders.length; i++) {
			const actualHeader = headers[i] ? String(headers[i]).trim() : "";
			if (actualHeader !== expectedHeaders[i]) {
				const errorMessage =
					"🔔 *Notificación MEGAMOTO:*\n\n❌ El archivo Excel no respeta la estructura de la plantilla original. Por favor, utilice la plantilla correcta sin modificar los encabezados ni agregar o sacar columnas.\n\n*Megamoto*";

				console.log(
					`El usuario ${vendorName} envió el archivo Leads incorrecto.`
				);

				// Notificar al usuario
				await handleWhatsappMessage(userPhone, errorMessage);
				return;
			}
		}

		const errorMessages = [];
		let rowNumber = 1;
		const dataRows = data.slice(1);

		for (const col of dataRows) {
			rowNumber++;
			const name = col[0] ? String(col[0]).trim() : "";
			const id_user = String(col[1]).trim();
			const toContact = col[4];
			const flow_2token = col[18] ? String(col[18]).trim() : null;

			// Validar nombre
			if (!name) {
				errorMessages.push(
					`❌ Fila ${rowNumber}: Nombre vacío - Teléfono (${id_user})`
				);
				continue;
			}

			// Validar teléfono
			if (!id_user || !/^\d+$/.test(id_user) || id_user.length < 6) {
				errorMessages.push(
					`❌ Fila ${rowNumber}: ${name} - Teléfono "${id_user}" inválido`
				);
				continue;
			}

			// Validar status
			let client_status = col[2];
			const originalClientStatus = client_status;

			if (!validClientStatuses.includes(client_status)) {
				const transformedStatus = transformToAccented(client_status);
				if (transformedStatus !== client_status) {
					client_status = transformedStatus;
				}

				if (!validClientStatuses.includes(client_status)) {
					errorMessages.push(
						`❌ Fila ${rowNumber}: ${name} (${id_user}) - Status "${originalClientStatus}" inválido`
					);
					continue;
				}
			}

			// Validar fecha a contactar
			if (toContact) {
				const date = new Date(toContact);
				if (isNaN(date.getTime())) {
					errorMessages.push(
						`❌ Fila ${rowNumber}: ${name} - Fecha a contactar "${toContact}" inválida`
					);
					continue;
				}
			}

			// Validar marca
			const brand = col[6] ? String(col[6]).trim() : "";
			if (brand && !validBrands.includes(brand)) {
				errorMessages.push(
					`❌ Fila ${rowNumber}: ${name} (${id_user}) - Marca "${brand}" inválida`
				);
				continue;
			}

			// Validar precio
			const price = col[8];
			if (price !== "" && price !== undefined && price !== null) {
				const cleanPrice = String(price).replace(/[^0-9.]/g, "");
				if (isNaN(cleanPrice) || cleanPrice !== String(price)) {
					errorMessages.push(
						`❌ Fila ${rowNumber}: ${name} (${id_user}) - Precio "${price}" inválido`
					);
					continue;
				}
			}

			const vendor = vendors.find(
				(v) => v.name.toLowerCase() === col[14].toLowerCase()
			);
			const vendorPhone = vendor ? vendor.phone : userPhone;

			const updateData = {
				"flows.$.name": name,
				"flows.$.client_status": client_status,
				"flows.$.toContact": col[4] ? new Date(col[4]) : undefined,
				"flows.$.brand": col[6],
				"flows.$.model": col[7],
				"flows.$.price": col[8],
				"flows.$.otherProducts": col[9],
				"flows.$.payment": col[10],
				"flows.$.dni": col[11],
				"flows.$.credit": col[12],
				"flows.$.vendor_name": col[14],
				"flows.$.vendor_phone": vendorPhone,
				"flows.$.vendor_notes": col[15],
				"flows.$.origin": col[17],
			};

			Object.keys(updateData).forEach(
				(key) => updateData[key] === undefined && delete updateData[key]
			);

			const existingLead = await Leads.findOne({
				id_user: id_user,
			});

			// Si no encuentra el lead x su número de teléfono, lo crea
			if (!existingLead) {
				const currentDateTime = new Date().toLocaleString("es-AR", {
					timeZone: "America/Argentina/Buenos_Aires",
					day: "2-digit",
					month: "2-digit",
					year: "numeric",
					hour: "2-digit",
					minute: "2-digit",
					second: "2-digit",
				});

				const newLead = new Leads({
					id_user: id_user,
					name: name,
					botSwitch: "ON",
					channel: "whatsapp",
					flows: [
						{
							client_status: updateData["flows.$.client_status"] || "vendedor",
							statusDate: `${currentDateTime}`,
							flowDate: `${currentDateTime}`,
							flow1Response: "si",
							toContact: updateData["flows.$.toContact"],
							messages: updateData["flows.$.messages"],
							brand: updateData["flows.$.brand"],
							model: updateData["flows.$.model"],
							price: updateData["flows.$.price"],
							otherProducts: updateData["flows.$.otherProducts"],
							payment: updateData["flows.$.payment"],
							dni: updateData["flows.$.dni"],
							credit: updateData["flows.$.credit"],
							vendor_name: vendorName,
							vendor_phone: vendorPhone,
							vendor_notes: updateData["flows.$.vendor_notes"],
							origin: updateData["flows.$.origin"] || "Salón",
							flow_2token: `2${uuidv4()}`,
							history: `${currentDateTime} Alta manual de ${vendorName}. Status - ${
								updateData["flows.$.client_status"] || "vendedor"
							}`,
						},
					],
				});

				await newLead.save();
				continue;
			}

			// Si encuentra el lead, busca el flowToken en el array de flows
			const flowIndex = flow_2token
				? existingLead.flows.findIndex(
						(flow) => flow.flow_2token === flow_2token
				  )
				: -1;

			// Si encuentra el flowToken, actualiza el flow correspondiente			
			if (flowIndex !== -1) {
				const currentDateTime = new Date().toLocaleString("es-AR", {
					timeZone: "America/Argentina/Buenos_Aires",
					day: "2-digit",
					month: "2-digit",
					year: "numeric",
					hour: "2-digit",
					minute: "2-digit",
					second: "2-digit",
				});

				const historyUpdate = `${
					existingLead.flows[flowIndex].history || ""
				} ${currentDateTime} - ${vendorName} actualizó Leads.xls. Status: ${
					updateData["flows.$.client_status"]
				} `;

				const statusChanged =
					existingLead.flows[flowIndex].client_status !==
					updateData["flows.$.client_status"];

				await Leads.updateOne(
					{
						id_user: id_user,
						"flows.flow_2token": flow_2token,
					},
					{
						$set: {
							[`flows.${flowIndex}.name`]:
								updateData["flows.$.name"],
							[`flows.${flowIndex}.client_status`]:
								updateData["flows.$.client_status"],
							[`flows.${flowIndex}.statusDate`]: statusChanged
								? currentDateTime
								: existingLead.flows[flowIndex].statusDate,
							[`flows.${flowIndex}.toContact`]: updateData["flows.$.toContact"],
							[`flows.${flowIndex}.messages`]: updateData["flows.$.messages"],
							[`flows.${flowIndex}.brand`]: updateData["flows.$.brand"],
							[`flows.${flowIndex}.model`]: updateData["flows.$.model"],
							[`flows.${flowIndex}.price`]: updateData["flows.$.price"],
							[`flows.${flowIndex}.otherProducts`]:
								updateData["flows.$.otherProducts"],
							[`flows.${flowIndex}.payment`]: updateData["flows.$.payment"],
							[`flows.${flowIndex}.dni`]: updateData["flows.$.dni"],
							[`flows.${flowIndex}.credit`]: updateData["flows.$.credit"],
							[`flows.${flowIndex}.vendor_name`]:
								updateData["flows.$.vendor_name"],
							[`flows.${flowIndex}.vendor_phone`]:
								updateData["flows.$.vendor_phone"],
							[`flows.${flowIndex}.vendor_notes`]:
								updateData["flows.$.vendor_notes"],
							[`flows.${flowIndex}.origin`]: updateData["flows.$.origin"],
							[`flows.${flowIndex}.history`]: historyUpdate,
						},
					}
				);
				
			} else {
				// Si no encuentra el flowToken salta a la siguiente fila y registra el error
				errorMessages.push(
					`❌ Fila ${rowNumber}: ${name} (${id_user}) - NO se pueden agregar Leads desde el Excel. Para ello envíe el teléfono por WhatsApp y espere la confirmación del sistema.`
				);
				continue; // salta a la siguiente fila
				
			}
		}

		if (errorMessages.length > 0) {
			const combinedErrorMessage = errorMessages.join("\n");
			const finalMessage = `🔔 *Notificación MEGAMOTO:*\n\nError al actualizar Leads:\n${combinedErrorMessage}\n\n*Megamoto*`;

			await handleWhatsappMessage(userPhone, finalMessage);

			console.log(
				`El vendedor ${vendorName} envió su Excel con sus leads y hubo un error: ${combinedErrorMessage}`
			);
		} else {
			await handleWhatsappMessage(
				userPhone,
				`🔔 *Notificación MEGAMOTO:*\n\n✅ ¡Se actualizaron ${dataRows.length} Leads!\n\n*Megamoto*`
			);

			console.log(
				`El vendedor ${vendorName} envió sus leads en Excel y se procesaron exitosamente ${dataRows.length} registros.`
			);
		}
	} catch (error) {
		console.error(
			`Error en processExcelToChangeLeads.js: Vendedor: ${vendorName}. Error: ${
				error?.response?.data
					? JSON.stringify(error.response.data)
					: error.message
			}`
		);

		const errorMessage = error?.response?.data
			? JSON.stringify(error.response.data)
			: error.message;

		await adminWhatsAppNotification(
			userPhone,
			`🔔 *NOTIFICACION DE ERROR:*\nError en processExcelToChangeLeads.js procesando Excel de ${vendorName}. Error: ${errorMessage}\n\n*Megamoto*`
		);
	}
};

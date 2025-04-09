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

		const messages = [];
		let successMessage = "✅ Filas actualizadas:";

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
				messages.push(
					`❌ Fila ${rowNumber}: Nombre vacío - Teléfono (${id_user})`
				);
				continue;
			}

			// Validar teléfono
			if (!id_user || !/^\d+$/.test(id_user) || id_user.length < 6) {
				messages.push(
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
					messages.push(
						`❌ Fila ${rowNumber}: ${name} (${id_user}) - Status "${originalClientStatus}" inválido`
					);
					continue;
				}
			}

			// Validar fecha a contactar
			if (toContact) {
				const date = new Date(toContact);
				if (isNaN(date.getTime())) {
					messages.push(
						`❌ Fila ${rowNumber}: ${name} - Fecha a contactar "${toContact}" inválida`
					);
					continue;
				}
			}

			// Validar marca
			const brand = col[6] ? String(col[6]).trim() : "";
			if (brand && !validBrands.includes(brand)) {
				messages.push(
					`❌ Fila ${rowNumber}: ${name} (${id_user}) - Marca "${brand}" inválida`
				);
				continue;
			}

			// Validar precio
			const price = col[8];
			if (price !== "" && price !== undefined && price !== null) {
				const cleanPrice = String(price).replace(/[^0-9.]/g, "");
				if (isNaN(cleanPrice) || cleanPrice !== String(price)) {
					messages.push(
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
				"flows.$.name": col[0],
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

			// Si encuentra el lead, busca el flowToken en el array de flows
			const flowIndex = flow_2token
				? existingLead.flows.findIndex(
						(flow) => flow.flow_2token === flow_2token
				  )
				: -1;

			// Si encuentra el flowToken, actualiza el flow correspondiente
			if (flowIndex !== -1) {
				const flow = existingLead.flows[flowIndex];

				console.log("userPhone:", userPhone)
				console.log("vendorPhone:", flow.vendor_phone)

				// Verificar si el vendedor tiene permiso para actualizar el registro
				if (flow.vendor_phone !== userPhone) {
					messages.push(
						`❌ Fila ${rowNumber}: ${name} (${id_user}) - El lead pertenece a ${flow.vendor_name}.`
					);
					continue; // Saltar a la siguiente fila
				}

				// Verificar si el status ya era de una operación cerrada
				if (
					flow.client_status === "compró" ||
					flow.client_status === "no compró"
				) {
					messages.push(
						`❌ Fila ${rowNumber}: ${name} (${id_user}) - NO se puede actualizar un lead con estado "${flow.client_status}. Comuníquese con Gustavo GV.".`
					);
					continue; // Saltar a la siguiente fila
				}

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
							name: updateData["flows.$.name"],
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

				// Concatenar fila exitosa al mensaje
				successMessage += ` ${rowNumber},`;
			} else {
				// Si no encuentra el flowToken salta a la siguiente fila y registra el error
				messages.push(
					`❌ Fila ${rowNumber}: ${name} (${id_user}) - NO se pueden agregar Leads desde el Excel. Para ello envíe el teléfono del Lead por WhatsApp y espere la confirmación.`
				);
				continue; // salta a la siguiente fila
			}
		}

		// Eliminar la última coma del mensaje de éxito si hay filas exitosas
		if (successMessage.endsWith(",")) {
			successMessage = successMessage.slice(0, -1);
		}

		// Mensaje al usario con los resultados de la actualización
		const combinedMessages = messages.join("\n");
		const finalMessage = `🔔 *Notificación MEGAMOTO:*\n\nResultados actualización de Leads:\n${successMessage}\n${combinedMessages}\n\n*Megamoto*`;

		await handleWhatsappMessage(userPhone, finalMessage);

		console.log(
			`El vendedor ${vendorName} envió su Excel con sus leads y recibió este mensaje: ${finalMessage}`
		);
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

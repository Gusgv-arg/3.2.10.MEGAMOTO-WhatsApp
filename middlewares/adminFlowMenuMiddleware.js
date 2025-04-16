import { handleWhatsappMessage } from "../utils/whatsapp/handleWhatsappMessage.js";
import { sendMenuToAdmin } from "../utils/templates/sendMenuToAdmin.js";
import { changeMegaBotSwitch } from "../functions/changeMegaBotSwitch.js";
import { changeAlarmSwitch } from "../functions/changeAlarmSwitch.js";
import { leadsStatusAnalysis } from "../utils/dataBase/leadsStatusAnalysis.js";
import { findFlowLeadsForVendors } from "../utils/dataBase/findFlowLeadsForVendors.js";
import { exportFlowLeadsToTemplate } from "../utils/excel/exportFlowLeadsToTemplate.js";
import { sendExcelByWhatsApp } from "../utils/excel/sendExcelByWhatsApp.js";
import { updateDbPricesFromExcel } from "../utils/dataBase/updatesDbPricesFromExcel.js";
import { scrapeFacebook } from "../functions/scrapeFacebook.js";
import { scrapeMercadoLibre } from "../functions/scrapeMercadoLibre.js";

const adminPhone = process.env.MY_PHONE;
const admin2Phone = process.env.MY_PHONE2;

export const adminFlowMenuMiddleware = async (req, res, next) => {
	const body = req.body;
	let isScrapperCalled = false;

	const userPhone = body.entry[0].changes[0]?.value?.messages?.[0]?.from
		? body.entry[0].changes[0].value.messages[0].from
		: "";

	let typeOfWhatsappMessage = body.entry[0].changes[0]?.value?.messages?.[0]
		?.type
		? body.entry[0].changes[0].value.messages[0].type
		: body.entry[0].changes[0];

	if (userPhone === adminPhone || userPhone === admin2Phone) {
		if (typeOfWhatsappMessage !== "interactive") {
			// Si detecta al Admin y No es un Flow envía el Flow con el Menú
			const notification = `*🔔 Notificación MEGAMOTO:*\n\n⚠️ Entrá a tu celular para ver el *Menú del Administrador*.\n\n*Megamoto*`;

			await handleWhatsappMessage(userPhone, notification);

			await sendMenuToAdmin(userPhone);

			return res.status(200).send("EVENT_RECEIVED");

        } else if (typeOfWhatsappMessage === "interactive") {
			res.status(200).send("EVENT_RECEIVED");

			const message =
				body.entry[0].changes[0].value.messages[0].interactive.nfm_reply
					.response_json;

			console.log("Entró un Flow de Admin:", message);

			// ----- FUNCIONES DEL ADMIN ------------------------------------------
			if (message.includes('"0_1-Prender_API_WhatsApp"')) {
				//Change general switch to ON
				await changeMegaBotSwitch("ON");

				const notification = `*🔔 Notificación MEGAMOTO:*\n\✅ La API de WhatsApp fue prendida.\n\n*Megamoto*`;

				// WhatsApp Admin notification
				await handleWhatsappMessage(userPhone, notification);

				console.log(`${userPhone} prendió la API.`);
			
            } else if (message.includes('"1_2-Apagar_API_WhatsApp"')) {
				//Change general switch to OFF
				await changeMegaBotSwitch("OFF");

				const notification = `*🔔 Notificación MEGAMOTO:*\n\n✅ La API de WhatsApp fue apagada.\n\n*Megamoto*`;

				// WhatsApp Admin notification
				await handleWhatsappMessage(userPhone, notification);

				console.log(`${userPhone} apagó la API.`);
			
            } else if (message.includes('"2_3-Prender_')) {
				
                console.log("Entró en el switch de la alarma de nuevos leads.");

				// Función para que me llegue una notificación cuando entra un nuevo lead
				const alarm = await changeAlarmSwitch();

				const message = `*🔔 Notificación:*\n\n✅ La alarma de nuevos leads fue puesta en *${alarm}*.\n\n*Megamoto*`;

				await handleWhatsappMessage(userPhone, message);
				console.log(
					`${userPhone} cambió la alarma de nuevos leads a ${alarm}.`
				);
			
            } else if (message.includes('"3_4-Status_Leads"')) {
				
				const status = await leadsStatusAnalysis();

				// WhatsApp Admin notification
				await handleWhatsappMessage(userPhone, status);

				console.log(
					`${userPhone} envío la palabra status y recibió el estado de los leads.`
				);
			
            } else if (message.includes('"4_5-Excel_con_Leads"')) {
				
				// Filtra de la BD los Leads disponibles para atender dentro del Flow
				const queue = await findFlowLeadsForVendors();
				//console.log("Queue", queue);

				// Chequea que haya leads en la fila
				if (queue.length > 0) {
					// Genera un Excel con los datos
					const excelFile = await exportFlowLeadsToTemplate(queue);
					//console.log("excel:", excelFile);

					// Se envía el Excel por WhatsApp
					await sendExcelByWhatsApp(userPhone, excelFile, "Leads");

					console.log(`Admin ${userPhone} recibió un excel con los leads.`);
				} else {
					const message = `*🔔 Notificación MEGAMOTO:*\n\n⚠️ No hay Leads de ningún vendedor que estén pendientes.\n\n*Megamoto*`;

					// Se notifica de que no hay Leads
					await handleWhatsappMessage(userPhone, message);

					console.log(
						`Admin ${userPhone} recibió un mensaje de que no hay leads x lo que no recibió el excel.`
					);
				}
			
            } else if (message.includes('"5_6-Campaña_WhatsApp"')) {
				
			
            } else if (message.includes('"6_7-Análisis_Precios_M._Libre"')) {
				if (isScrapperCalled === false) {
					isScrapperCalled = true;
					res.status(200).send("EVENT_RECEIVED");
					const precios = await scrapeMercadoLibre(userPhone);

					console.log(
						`${userPhone} recibió el excel con los precios de Mercado Libre.`
					);
				} else {
					//console.log("isScrapperCelles esta en:", isScrapperCalled);
					
				}

			} else if (message.includes('"7_8-Análisis_Avisos_Facebook"')) {
				
				await scrapeFacebook(userPhone);

				console.log(
					`${userPhone} recibió el excel con los avisos de Facebook de la competencia.`
				);

			} else if (message.includes('"8_9-Actualizar_Precios"')) {
				
				const notification = await updateDbPricesFromExcel();

				await handleWhatsappMessage(userPhone, notification);

				console.log(`${userPhone} corrió la actualización de precios.`);
			}
		}
	} else {
        next()
    }
};

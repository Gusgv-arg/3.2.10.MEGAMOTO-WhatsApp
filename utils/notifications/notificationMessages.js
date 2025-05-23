export const botSwitchOnNotification = "🔔 *NOTIFICACION Automática:*\nLa API de Megamoto fue puesta en *ON* y está lista para responder enviando el Flow 1."

export const botSwitchOffNotification = "🔔*NOTIFICACION Automática:*\nLa API fue puesta en *OFF* por lo que no responderá a nadie, salvo al administrador."

export const inexistingTemplate = "🔔 *NOTIFICACION Automática:*\nNo existe una Plantilla aprobada por WhatsApp con el nombre "

export const helpFunctionNotification = `🔔 *NOTIFICACION Automática:*\n¡Bienvenido Administrador de Megamoto!\nSe listan las funcionalidades al enviar mensajes de texto por WhatsApp:\n\n- *"Megamoto":* envía este mensaje en donde se enumeran las funciones disponibles.\n- *"Responder":* encendido de la API.\n- *"No responder":* apagado de la API.\n- *"Alarma":* prende o apaga la alarma de nuevos leads.\n- *"Leads":* envía un Excel con los leads en proceso.\n*"Status":* envía análisis de los Leads actuales.\n- *"Campaña":* adjuntar Excel y en comentario colocar la palabra "campaña" + "Nombre de la Plantilla de WhatsApp" + "Nombre de la Campaña (cualquier nombre)" *(Ej.: "campaña promoción1 campaña1")*. El formato del Excel debe tener encabezados en donde la columna A debe ser el WhatsApp, y el resto serán las variables ordenadas de acuerdo a la Plantilla.\n- *"Activar" + "Nombre de Campaña":* activa la Campaña.\n- *"Inactivar" + "Nombre de Campaña":* inactiva la Campaña.\n- *"Campañas":* Listado de Campañas (fecha, nombre, status, clientes, respuestas).\n- *"Precios:"* envía un Excel con un análisis de precios en Mercado Libre.\n- *"Facebook":* envía un Excel en donde están los avisos publicados en Facebook de los competidores.\n- *"Actualizar precios":* actualiza precios en la base de datos con el Excel del compartido.\n\n*Megamoto*`

export const noPromotions = "🔔 *NOTIFICACION Automática:*\nTomamos conocimiento de que *NO* desea recibir más promociones. ¡Que tenga un buen día!\n\n*Megamoto*"

export const templateError = `🔔 *NOTIFICACION de Error:*\nPara generar una Campaña debe enviar en la descripción del Excel que adjunta la palabra 'campaña' seguido del nombre de la plantilla de WhatsApp seguido del nombre que le quiera dar a la Campaña. (Ejemplo: "campaña plantilla1 campaña1").`

export const pagoContadoOTarjeta = "¡Perfecto! Un vendedor se contactará contigo a la brevedad. ¡Hasta pronto!";

export const pagoConPrestamo = "¡Perfecto! Verificamos con el DNI que nos pasaron en el Acuerdo, y no te otorgan crédito suficiente para el total de la moto, por lo cual vamos a necesitar el DNI de algún conocido tuyo que no tenga deudas y que salga de garante. Si estás de acuerdo, por favor pasámelo por este medio para verificar y ya te avisamos.";

export const noGracias = "Ok gracias por tu tiempo, cualquier consulta podés volver a este chat cuando quieras. ¡Saludos!";

export const tengoConsultas = "¡Perfecto! Un vendedor se contactará contigo a la brevedad. ¡Hasta pronto!"

export const dniNotification =
				"¡Gracias por enviarnos el DNI del garante! Un vendedor se va a encargar de verificarlo y te informa a la brevedad. ¡Que tengas un buen día!";
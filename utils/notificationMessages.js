export const botSwitchOnNotification = "*NOTIFICACION:* MegaBot fue puesto en *ON* y está listo para responder."

export const botSwitchOffNotification = "*NOTIFICACION:* MegaBot fue puesto en *OFF* por lo que no responderá."

export const inexistingTemplate = "*NOTIFICACION:* No existe una Plantilla aprobada por WhatsApp con el nombre "

export const helpFunctionNotification = `*¡Bienvenido Administrador de MegaBot!*\nA continuación se listan las funcionalidades al enviar los siguientes mensajes de texto por WhatsApp:\n\n1. *"Megabot":* envía este mensaje en donde se enumeran las funcionalidades disponibles.\n2. *"Megabot responder":* encendido de MegaBot.\n3. *"MegaBot no responder":* apagado de MegaBot.\n4. *"Campaña":* adjuntar Excel y en comentario colocar la palabra "campaña" + "Nombre de la Plantilla de WhatsApp" + "Nombre de la Campaña (cualquier nombre)" *(Ej.: "campaña promoción1 campaña1")*. El formato del Excel debe tener encabezados en donde la columna A debe ser el WhatsApp, y el resto serán las variables ordenadas de acuerdo a la Plantilla.\n5. *"Activar" + "Nombre de Campaña":* activa la Campaña.\n6. *"Inactivar" + "Nombre de Campaña":* inactiva la Campaña.\n7. *MegaBot campañas:* Listado de Campañas (fecha, nombre, status, clientes, respuestas).\n8. *"MegaBot leads":* envía un mail con un Excel con el detalle de los leads.\n9. *"Megabot precios:"* envía un Excel con un análisis de precios en Mercado Libre.\n10. *"Megabot facebook":* envía un Excel en donde están los avisos publicados en Facebook de los competidores.\n\n*¡Con el tiempo iremos sumando más!*`

export const noPromotions = "*NOTIFICACION:* Tomamos conocimiento de que *NO* desea recibir más promociones. ¡Que tenga un buen día!"

export const templateError = `*NOTIFICACION de Error:*\nPara generar una Campaña debe enviar en la descripción del Excel que adjunta la palabra 'campaña' seguido del nombre de la plantilla de WhatsApp seguido del nombre que le quiera dar a la Campaña. (Ejemplo: "campaña plantilla1 campaña1").`

export const pagoContadoOTarjeta = "¡Perfecto! Un vendedor se contactará contigo a la brevedad. ¡Hasta pronto!";

export const pagoConPrestamo = "¡Perfecto! Verificamos con el DNI que nos pasaron en el Acuerdo, y no te otorgan crédito suficiente para el total de la moto, por lo cual vamos a necesitar el DNI de algún conocido tuyo que no tenga deudas y que salga de garante. Si estás de acuerdo, por favor pasámelo por este medio para verificar y ya te avisamos.";

export const noGracias = "Ok gracias por tu tiempo, cualquier consulta podés volver a este chat cuando quieras. ¡Saludos!";

export const tengoConsultas = "¡Perfecto! Un vendedor se contactará contigo a la brevedad. ¡Hasta pronto!"

export const dniNotification =
				"¡Gracias por enviarnos el DNI del garante! Un vendedor se va a encargar de verificarlo y te informa a la brevedad. ¡Que tengas un buen día!";
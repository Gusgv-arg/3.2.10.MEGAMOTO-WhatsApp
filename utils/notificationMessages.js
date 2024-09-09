export const botSwitchOnNotification = "*NOTIFICACION:* MegaBot fue puesto en *ON* y está listo para responder."

export const botSwitchOffNotification = "*NOTIFICACION:* MegaBot fue puesto en *OFF* por lo que no responderá."

export const helpFunctionNotification = `*¡Bienvenido Administrador de MegaBot!*\nA continuación se listan las funcionalidades al enviar los siguientes mensajes de texto por WhatsApp:\n\n1. *"Megabot":* envía este mensaje en donde se enumeran las funcionalidades disponibles.\n2. *"Megabot responder":* encendido de MegaBot.\n3. *"MegaBot no responder":* apagado de MegaBot.\n4. *"Campaña":* adjuntar Excel y en comentario colocar la palabra "campaña, nombre de la Plantilla de WhatsApp y nombre de la Campaña (cualquier nombre)" *(Ej.: "campaña promocion1 campaña1")*. El formato del Excel debe tener encabezados en donde la columna A debe ser el WhatsApp, la columna B el nombre del cliente y el resto serán las variables ordenadas de acuerdo a la Plantilla.\n\n*¡Con el tiempo iremos sumando más!*`

export const noPromotions = "*NOTIFICACION:* Tomamos conocimiento de que *NO* desea recibir más promociones. ¡Que tenga un buen día!"

export const templateError = `*NOTIFICACION de Error:*\nPara generar una Campaña debe enviar en la descripción del Excel que adjunta la palabra 'campaña' seguido del nombre de la plantilla de WhatsApp seguido del nombre que le quiera dar a la Campaña. (Ejemplo: "campaña plantilla1 campaña1").`

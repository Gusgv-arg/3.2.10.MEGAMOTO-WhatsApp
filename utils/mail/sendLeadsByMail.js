import axios from "axios";
import nodemailer from "nodemailer";
import { adminWhatsAppNotification } from "../notifications/adminWhatsAppNotification.js";

const transporter = nodemailer.createTransport({
	host: "smtp.gmail.com",
	port: 587,
	secure: false,
	auth: {
		user: process.env.SMTP_EMAIL,
		pass: process.env.SMTP_PASSWORD,
	},
});

// Función para enviar el archivo por correo electrónico
export const sendLeadsByMail = async (filePath, mail, userPhone) => {
	const mailOptions = {
		from: process.env.SMTP_EMAIL,
		to: mail,
		subject: "Excel con Leads de MegaBot",
		text: "Adjunto el archivo Excel con las respuestas de MegaBot.",
		attachments: [
			{
				filename: "Leads.xlsx",
				path: filePath,
			},
		],
	};

	try {
		let info = await transporter.sendMail(mailOptions);

		// Notify the Admin by WhatsApp
		await adminWhatsAppNotification(
			userPhone,
			`🔔 *NOTIFICACION envío Leads.xls por mail:*\nSe envió Leads.xls por mail a ${mail}.`
		);
	} catch (error) {
		console.error("Error en sendLeadsByMail.js:", error.message);
		throw error;
	}
};

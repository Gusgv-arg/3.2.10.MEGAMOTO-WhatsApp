import axios from "axios";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { adminWhatsAppNotification } from "./adminWhatsAppNotification.js";

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
export const sendLeadsByMail = async (filePath) => {
	const mailOptions = {
		from: process.env.SMTP_EMAIL,
		to: process.env.MY_MAIL,
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
			`*NOTIFICACION envío Leads.xls por mail:*\nSe envió Leads.xls por mail a ${process.env.MY_MAIL}.`
		);
		
	} catch (error) {
		console.error("Error en sendLeadsByMail.js:", error.message);
		throw error;
	}
};

import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import { errorHandler } from "./utils/errors/errorHandler.js";
import testingRouter from "./routers/testingRouter.js";
import whatsappRouter from "./routers/whatsappRouter.js";
import BotSwitch from "./models/botSwitch.js"
import createBotSwitchInstance from "./utils/dataBase/createBotSwitchInstance.js";
import path from 'path';
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

mongoose
	.connect(process.env.MONGODB_URI)
	.then(() => {
		console.log("Connected to MEGAMOTO data base");
	})
	.catch((err) => {
		console.log(err.message);
	});

const app = express();

app.use(
	cors({
		origin: ["*", "http://localhost:3000"],
		credentials: true,
	})
);
app.use(express.json());
app.use(morgan("dev"));
//app.use(express.static(path.join(__dirname, "public")));
app.use("/public", express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

// Looking for General Bot Switch
let botSwitchInstance;
try {
	botSwitchInstance = await BotSwitch.findOne();
	if (botSwitchInstance) {
		console.log(`MegaBot is ${botSwitchInstance.generalSwitch}`);
	} else {
		let botSwitch = new BotSwitch({
			generalSwitch: "ON",
		});
		await botSwitch.save();
		console.log(`BotSwitch created and set to ${botSwitch.generalSwitch}`);
	}
} catch (error) {
	console.error("Error initializing bot switch:", error.message);
	console.log("Retrying to create botSwitchInstance...");
    await createBotSwitchInstance();
}

app.use("/webhook", whatsappRouter);
app.use("/testing", testingRouter);

// Middleware de manejo de errores
app.use(errorHandler);

const port = process.env.PORT || 8000

app.listen(port, () => {
	console.log(`Server running at ${process.env.NODE_ENV === 'production' ? 'https://three-2-10-megamoto-campania-whatsapp.onrender.com' : `http://localhost:${port}`}`);
});

import express from "express";
import { getMessengerWebhookController } from "../controllers/getMessengerWebhookController.js";
import { postMessengerWebhookController } from "../controllers/postMessengerWebhookController.js";
import { userMessengerMiddleware } from "../middlewares/userMessengerMiddleware.js";
import { messengerGeneralBotSwitchMiddleware } from "../middlewares/messengerGeneralBotswitchMiddleware.js";

const messengerRouter = express.Router();

messengerRouter.get("/", getMessengerWebhookController);
messengerRouter.post(
	"/",
	messengerGeneralBotSwitchMiddleware,
	userMessengerMiddleware,
	postMessengerWebhookController
);

export default messengerRouter;

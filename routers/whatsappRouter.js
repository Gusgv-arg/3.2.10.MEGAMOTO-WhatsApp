import express from "express";
import { getWhatsappWebhookController } from "../controllers/getWhatsappWebhookController.js";
import { postWhatsappWebhookController } from "../controllers/postWhastsappWebhookController.js";
import { adminFunctionsMiddleware } from "../middlewares/adminFunctionsMiddleware.js";
import { whatsAppGeneralBotSwitchMiddleware } from "../middlewares/whatsAppGeneralBotSwitchMiddleware.js";
import { postWhatsAppCampaign } from "../functions/postWhatsAppCampaign.js";
import { statusMiddleware } from "../middlewares/statusMiddleware.js";
import { statusFlowsMiddleware } from "../middlewares/statusFlowsMiddleware.js";

const whatsappRouter = express.Router();

whatsappRouter.get("/", getWhatsappWebhookController);
whatsappRouter.post(
	"/",
	//statusMiddleware,
	statusFlowsMiddleware,
	adminFunctionsMiddleware,
	whatsAppGeneralBotSwitchMiddleware,
	postWhatsappWebhookController
);

// Endpoint for testing purposes or for sending from localhost instead of whatsapp 
whatsappRouter.post("/campaign", postWhatsAppCampaign);

export default whatsappRouter;

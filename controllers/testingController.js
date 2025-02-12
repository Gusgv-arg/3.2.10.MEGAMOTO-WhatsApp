import { handleTestMessage } from "../utils/others/handleTestMessage.js";
import { processMessageWithAssistant } from "../utils/ai/processMessageWithAssistant.js";

export const testingController = (req, res) => {
	res.status(200).send("Estoy prendido");
};

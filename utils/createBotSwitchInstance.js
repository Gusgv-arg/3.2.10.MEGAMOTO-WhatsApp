import BotSwitch from "../models/botSwitch.js";

let botSwitchInstance;
let maxRetries = 5;
let retries = 0;

async function createBotSwitchInstance() {
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
        retries++;
        if (retries < maxRetries) {
            console.log(`Retrying (${retries}/${maxRetries})...`);
            await createBotSwitchInstance();
        } else {
            console.error("Max retries exceeded. Exiting...");
            //process.exit(1);
            return
        }
    }
}

export default createBotSwitchInstance
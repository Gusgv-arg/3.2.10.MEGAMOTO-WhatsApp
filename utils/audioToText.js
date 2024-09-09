import OpenAI from "openai";
import dotenv from "dotenv";
import axios from "axios"
import fs from "fs";
dotenv.config();

const API_KEY = process.env.API_KEY_CHATGPT;

const openai = new OpenAI({
    apiKey: API_KEY,
	organization: "org-6qNfHtCMODNqGNtPAbbhLhfA",
	project: "proj_cLySVdd60XL8zbjd9zc8gGMH",
});

async function audioToText(audioFile, channel) {
	try {		
		if (channel === "whatsapp"){
			// Write buffer to a tempory file
			const tempFilePath = `/tmp/audio_${Date.now()}.ogg`;
			await fs.promises.writeFile(tempFilePath, audioFile);
	
			const transcription = await openai.audio.transcriptions.create({
				file: fs.createReadStream(tempFilePath),
				model: "whisper-1",
			});
			// Erase temporary file
			await fs.promises.unlink(tempFilePath);
			return transcription.text;
		
		} else if(channel === "messenger"){
			// Transform URL to a file
			let file;
			if (typeof audioFile === 'string' && audioFile.startsWith('http')) {
				// If audioFile is a URL, download it
				const response = await axios.get(audioFile, { responseType: 'arraybuffer' });
				file = new File([response.data], 'audio.mp3', { type: 'audio/mpeg' });
			} else {
				file = audioFile;
			}

			const transcription = await openai.audio.transcriptions.create({
				file: file,
				model: "whisper-1",
			});	
			return transcription.text;
		}
	} catch (error) {
		console.log("Error in audioToText:", error.message)
		throw error
	}
}

export default audioToText;

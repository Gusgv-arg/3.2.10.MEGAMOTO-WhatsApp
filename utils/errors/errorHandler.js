import { logError } from "./logError.js";

// Middleware for error handling
export const errorHandler = (err, req, res, next) => {
	logError(err, "Unhandled error");
	res.status(500).send({error: err.message});
};

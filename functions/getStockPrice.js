import yahooFinance from "yahoo-finance2";

export const getStockPrice = async (symbol) => {
	try {
		const quote = await yahooFinance.quote(symbol);
		return {
			symbol: symbol,
			price: quote.regularMarketPrice,
			currency: quote.currency,
		};
	} catch (error) {
		console.error(`Error fetching stock price for ${symbol}: ${error}`);
		throw error;
	}
};

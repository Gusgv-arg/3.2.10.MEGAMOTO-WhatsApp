import { join } from "path";

/** @type {import('puppeteer').Configuration} */

module.exports = {
	cacheDirectory: join('/opt/render/.cache', 'puppeteer'),
};

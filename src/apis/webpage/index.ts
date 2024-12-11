import fetch from 'node-fetch';

export class WebpageApi {
	/**
	 * Fetches the HTML content of a given URL.
	 * @param url A fully qualified URL (e.g., https://www.example.com/)
	 * @returns A string containing the HTML of the page.
	 */
	async getWebpageContent(url: string): Promise<string> {
		// Validate URL format
		try {
			new URL(url);
		} catch (error) {
			throw new Error(`Invalid URL: ${url}`);
		}

		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(
				`Failed to fetch ${url}: ${response.status} ${response.statusText}`,
			);
		}

		const text = await response.text();
		return text;
	}
}

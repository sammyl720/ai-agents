export class GoogleSearchApi {
	constructor(
		private apiKey: string,
		private cseId: string,
	) {}

	/**
	 * Perform a Google Search using Custom Search Engine
	 * @param query The search query
	 * @param numResults Number of results to return (1-10)
	 */
	async search(query: string, numResults = 5): Promise<any> {
		const params = new URLSearchParams({
			key: this.apiKey,
			cx: this.cseId,
			q: query,
			num: numResults.toString(),
		});

		const url = `https://www.googleapis.com/customsearch/v1?${params.toString()}`;

		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`Google Search API error: ${response.statusText}`);
		}

		const data = await response.json();
		return data.items || [];
	}
}

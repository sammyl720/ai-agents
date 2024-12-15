import type {
	AmazonOfferConditionOption,
	AmazonOffersResponse,
	AmazonProductDetailsResponse,
	AmazonSearchResult,
} from './types.js';

export type TopLevelDomain = 'com' | 'ca';

const ROOT_ENDPOINT = 'https://api.scraperapi.com/structured/amazon';

/**
 * Wrapper for [scraperapi structured data collections](https://docs.scraperapi.com/nodejs/making-requests/structured-data-collection-method/amazon-search-api)
 */
export class AmazonApi {
	constructor(
		private apiKey: string,
		private tld: TopLevelDomain = 'com',
		private country = 'us',
	) {}

	/**
	 * Search for amazon products
	 * @param query What to search for
	 * @param pageNumber
	 * @returns
	 */
	async search(
		query: string,
		pageNumber?: number,
	): Promise<AmazonSearchResult> {
		const params = new URLSearchParams();
		params.set('api_key', this.apiKey);
		params.set('country', this.country);
		params.set('query', query);
		params.set('tld', this.tld);
		if (pageNumber) {
			params.set('page', pageNumber.toString());
		}
		const url = `${ROOT_ENDPOINT}/search?${params.toString()}`;
		const response = await fetch(url);
		const json = await response.json();
		return json.results;
	}

	/**
	 * Retrieve Product Details
	 * @param asin Amazon Standard Identification Number.
	 * @returns @see {@link AmazonProductDetailsResponse}
	 */
	async getProductDetails(asin: string): Promise<string> {
		const params = new URLSearchParams();
		params.set('api_key', this.apiKey);
		params.set('country', this.country);
		params.set('asin', asin);
		params.set('tld', this.tld);

		const url = `${ROOT_ENDPOINT}/product?${params.toString()}`;
		const response = await fetch(url);
		return response.text();
	}

	/**
	 * Retrieve Product Offers
	 * @param asin Amazon Standard Identification Number.
	 * @returns @see {@link AmazonOffersResponse}
	 */
	async getOffers(
		asin: string,
		options: AmazonOfferConditionOption = {},
	): Promise<AmazonOffersResponse> {
		const params = new URLSearchParams();
		params.set('api_key', this.apiKey);
		params.set('country', this.country);
		params.set('asin', asin);
		params.set('tld', this.tld);

		for (const [key, value] of Object.entries(options)) {
			if (typeof value === 'undefined') continue;
			params.set(key, value.toString());
		}

		const url = `${ROOT_ENDPOINT}/offers?${params.toString()}`;
		const response = await fetch(url);
		const json = (await response.json()) as AmazonOffersResponse;
		return json;
	}
}

import type { GoogleTrendsJsonResponse, GoogleTrendsParams } from './types.js';

/**
 * Class That implements **SerpeAPI** [Google Trends Api](https://serpapi.com/google-trends-api)
 */
export class GoogleTrendsApi {
	private apiKey: string;
	private baseUrl: string = 'https://serpapi.com/search';

	constructor(apiKey: string) {
		this.apiKey = apiKey;
	}

	/**
	 * Performs a search on the Google Trends data using SerpApi.
	 *
	 * @param params Query parameters as per the Google Trends API documentation.
	 * @returns A promise resolving to the parsed JSON response or raw HTML (depending on the `output` parameter).
	 */
	public async search(
		params: GoogleTrendsParams,
	): Promise<GoogleTrendsJsonResponse> {
		const searchParams = new URLSearchParams();

		// Required parameters
		searchParams.set('engine', 'google_trends');
		searchParams.set('api_key', this.apiKey);

		// Optional parameters
		if (params.q !== undefined) searchParams.set('q', params.q);
		if (params.hl !== undefined) searchParams.set('hl', params.hl);
		if (params.geo !== undefined) searchParams.set('geo', params.geo);
		if (params.region !== undefined) searchParams.set('region', params.region);
		if (params.data_type !== undefined)
			searchParams.set('data_type', params.data_type);
		if (params.tz !== undefined) searchParams.set('tz', String(params.tz));
		if (params.cat !== undefined)
			searchParams.set('cat', params.cat.toString());
		if (params.gprop !== undefined) searchParams.set('gprop', params.gprop);
		if (params.date !== undefined) searchParams.set('date', params.date);
		if (params.csv !== undefined) searchParams.set('csv', String(params.csv));
		if (params.include_low_search_volume !== undefined) {
			searchParams.set(
				'include_low_search_volume',
				String(params.include_low_search_volume),
			);
		}
		if (params.no_cache !== undefined)
			searchParams.set('no_cache', String(params.no_cache));
		if (params.async !== undefined)
			searchParams.set('async', String(params.async));
		if (params.zero_trace !== undefined)
			searchParams.set('zero_trace', String(params.zero_trace));

		const url = `${this.baseUrl}.json?${searchParams.toString()}`;

		const response = await fetch(url, {
			method: 'GET',
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(
				`Request failed: ${response.status} ${response.statusText} - ${errorText}`,
			);
		}

		return response.json() as Promise<GoogleTrendsJsonResponse>;
	}
}

/**
 * Parameters for querying Google Trends through SerpApi.
 */
export interface GoogleTrendsParams {
	/**
	 * Defines the query or queries you want to search. Required for some data types.
	 * If passing multiple queries, separate them by commas (e.g. "coffee,milk,bread").
	 * Maximum 5 queries for TIMESERIES/GEO_MAP data types; otherwise only 1 query is accepted.
	 * A query can be a "Search term" (e.g. "World Cup") or a "Topic" (e.g. "/m/0663v").
	 */
	q?: string;

	/**
	 * Defines the language to use for the Google Trends search.
	 * It's a two-letter language code (e.g., "en", "es", "fr").
	 * Defaults to English if not specified.
	 */
	hl?: string;

	/**
	 * Defines the location from where you want the search to originate.
	 * Defaults to Worldwide if not set.
	 * See SerpApi docs for a full list of supported Google Trends locations.
	 */
	geo?: string;

	/**
	 * Used when data_type is GEO_MAP or GEO_MAP_0 (interest by region).
	 * Can be "COUNTRY", "REGION", "DMA", or "CITY".
	 * Not all region options return results for every geo location.
	 */
	region?: 'COUNTRY' | 'REGION' | 'DMA' | 'CITY';

	/**
	 * Defines the type of search you want to do.
	 * Options:
	 * - TIMESERIES: Interest over time (default)
	 * - GEO_MAP: Compared breakdown by region (requires multiple queries)
	 * - GEO_MAP_0: Interest by region (single query)
	 * - RELATED_TOPICS: Related topics (single query)
	 * - RELATED_QUERIES: Related queries (single query)
	 */
	data_type?:
		| 'TIMESERIES'
		| 'GEO_MAP'
		| 'GEO_MAP_0'
		| 'RELATED_TOPICS'
		| 'RELATED_QUERIES';

	/**
	 * Defines a timezone offset in minutes. Default is 420 (PDT, UTC-7).
	 * Range: -1439 to 1439.
	 * Used to align time-sensitive data with a local timezone.
	 */
	tz?: number;

	/**
	 * Defines a search category. Default is 0 (All categories).
	 * See Google Trends Categories for a full list of supported categories.
	 */
	cat?: string;

	/**
	 * Used for sorting results by property.
	 * Default is Web Search if not set.
	 * Options: "images", "news", "froogle" (Google Shopping), "youtube".
	 */
	gprop?: 'images' | 'news' | 'froogle' | 'youtube';

	/**
	 * Defines a date range or period for the data.
	 * Examples: "now 1-H", "today 12-m", "2021-10-15 2022-05-25", etc.
	 * See documentation for all supported formats.
	 */
	date?: string;

	/**
	 * Set to true to retrieve CSV results as an array.
	 */
	csv?: boolean;

	/**
	 * Set to true to include low search volume regions in the results.
	 * Ignored unless data_type is GEO_MAP or GEO_MAP_0.
	 */
	include_low_search_volume?: boolean;

	/**
	 * Forces SerpApi to fetch new results even if a cached version exists.
	 * Set to true to bypass cache. Defaults to false.
	 */
	no_cache?: boolean;

	/**
	 * Defines asynchronous retrieval mode.
	 * Set to true to return immediately and fetch results later using the archive.
	 * Defaults to false (synchronous).
	 * Cannot be used together with no_cache.
	 */
	async?: boolean;

	/**
	 * Enterprise only. Enables ZeroTrace mode when set to true.
	 * Skips storing search parameters, files, and metadata on SerpApi servers.
	 * Defaults to false.
	 */
	zero_trace?: boolean;
}

/**
 * Represents the structure of the JSON response returned by the Google Trends API.
 * Note: This is a broad interface and may not cover all fields depending on `data_type`.
 */
export interface GoogleTrendsJsonResponse {
	search_metadata: {
		id: string;
		status: string;
		json_endpoint: string;
		created_at?: string;
		processed_at?: string;
		google_trends_url?: string;
		raw_html_file?: string;
		prettify_html_file?: string;
		total_time_taken?: number;
		[key: string]: any;
	};
	search_parameters: {
		engine: 'google_trends';
		q?: string;
		hl?: string;
		geo?: string;
		region?: string;
		data_type?: string;
		tz?: string;
		cat?: string;
		gprop?: string;
		date?: string;
		csv?: string;
		include_low_search_volume?: string;
		no_cache?: string;
		async?: string;
		zero_trace?: string;
		[key: string]: any;
	};
	interest_over_time?: {
		timeline_data: Array<{
			date: string;
			timestamp: string;
			values: Array<{
				query?: string;
				value: string;
				extracted_value: number;
			}>;
		}>;
		averages?: Array<{
			query?: string;
			value: number;
		}>;
		[key: string]: any;
	};
	compared_breakdown_by_region?: Array<{
		geo: string;
		location: string;
		max_value_index: number;
		values: Array<{
			query?: string;
			value: string;
			extracted_value: number;
		}>;
	}>;
	interest_by_region?: Array<{
		geo: string;
		location: string;
		max_value_index: number;
		value: string;
		extracted_value: number;
	}>;
	related_topics?: {
		rising?: Array<{
			topic: {
				value: string;
				title: string;
				type: string;
			};
			value: string;
			extracted_value: number;
			link: string;
			serpapi_link: string;
		}>;
		top?: Array<{
			topic: {
				value: string;
				title: string;
				type: string;
			};
			value: string;
			extracted_value: number;
			link: string;
			serpapi_link: string;
		}>;
	};
	related_queries?: {
		rising?: Array<{
			query: string;
			value: string;
			extracted_value: number;
			link: string;
			serpapi_link: string;
		}>;
		top?: Array<{
			query: string;
			value: string;
			extracted_value: number;
			link: string;
			serpapi_link: string;
		}>;
	};
	[key: string]: any;
}

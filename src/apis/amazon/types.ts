export interface AmazonSearchResult {
	ads: Ad[];
	amazons_choice: any[];
	results: Result[];
	explore_more_items: any[];
	pagination: string[];
}

export interface Ad {
	type: string;
	position: number;
	name: string;
	image: string;
	has_prime: boolean;
	is_best_seller: boolean;
	is_amazon_choice: boolean;
	is_limited_deal: boolean;
	stars: number;
	total_reviews: number;
	url: string;
	availability_quantity: any;
	spec: Spec;
	price_string: string;
	price_symbol: string;
	price: number;
}

export interface Spec {}

export interface Result {
	type: string;
	position: number;
	name: string;
	image: string;
	has_prime: boolean;
	is_best_seller: boolean;
	is_amazon_choice: boolean;
	is_limited_deal: boolean;
	stars: number;
	total_reviews: number;
	url: string;
	availability_quantity: any;
	spec: Spec2;
	price_string: string;
	price_symbol: string;
	price: number;
	section_name?: string;
}

export interface Spec2 {}

export interface AmazonOffersResponse {
	item: Item;
	listings: Listing[];
	pagination: any[];
}

export interface Item {
	name: string;
	subtitle: string;
	author: string;
	brand: string;
	product_information: ProductInformation;
	listings_link: string;
	image: string;
	average_rating: number;
	total_reviews: number;
}

export interface ProductInformation {
	brand: string;
	series: string;
	screen_size: string;
	color: string;
	hard_disk_size: string;
	cpu_model: string;
	ram_memory_installed_size: string;
	operating_system: string;
	card_description: string;
	graphics_coprocessor: string;
}

export interface Listing {
	price_with_currency: string;
	price: any;
	shipping_price: any;
	has_prime_shipping: boolean;
	ships_from: string;
	sold_by: string;
	fullfilled_by_amazon: boolean;
}

export interface AmazonOfferConditionOption
	extends Record<string, boolean | undefined> {
	/**
	 * Boolean parameter with a possible value of true or false indicating the condition of the listed items.
	 */
	f_new?: boolean;

	/**
	 * Boolean parameter with a possible value of true or false indicating the condition of the listed items.
	 */
	f_used_good?: boolean;

	/**
	 * Boolean parameter with a possible value of true or false indicating the condition of the listed items.
	 */
	f_used_like_new?: boolean;

	/**
	 * Boolean parameter with a possible value of true or false indicating the condition of the listed items.
	 */
	f_used_very_good?: boolean;

	/**
	 * Boolean parameter with a possible value of true or false indicating the condition of the listed items.
	 */
	f_used_acceptable?: boolean;
}

export interface AmazonProductDetailsResponse {
	name: string;
	product_information: ProductInformation;
	brand: string;
	brand_url: string;
	full_description: string;
	pricing: string;
	list_price: string;
	shipping_price: any;
	availability_status: string;
	images: string[];
	product_category: string;
	average_rating: number;
	small_description: string;
	feature_bullets: string[];
	total_reviews: number;
	total_answered_questions: number;
	model: string;
	customization_options: CustomizationOptions;
	seller_id: any;
	seller_name: any;
	fulfilled_by_amazon: any;
	fast_track_message: string;
	aplus_present: boolean;
}

export interface ProductInformation {
	product_dimensions: string;
	color: string;
	material: string;
	style: string;
	product_care_instructions: string;
	number_of_items: string;
	brand: string;
	fabric_type: string;
	unit_count: string;
	item_weight: string;
	asin: string;
	item_model_number: string;
	manufacturer_recommended_age: string;
	best_sellers_rank: string[];
	customer_reviews: CustomerReviews;
	is_discontinued_by_manufacturer: string;
	release_date: string;
	manufacturer: string;
}

export interface CustomerReviews {
	ratings_count: number;
	stars: string;
}

export interface CustomizationOptions {
	style: Style[];
}

export interface Style {
	is_selected: boolean;
	url?: string;
	value: string;
	price_string: string;
	price: number;
	image: any;
}

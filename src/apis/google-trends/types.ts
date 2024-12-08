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
	cat?: GoogleTrendsCategories | ProductCategories;

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

export enum GoogleTrendsCategories {
	AllCategories = 0,
	ArtsAndEntertainment = 3,
	ComputersAndElectronics = 5,
	CelebritiesAndEntertainmentNews = 184,
	ComicsAndAnimation = 316,
	AnimatedFilms = 1104,
	AnimeAndManga = 317,
	Cartoons = 319,
	Comics = 318,
	EntertainmentIndustry = 612,
	FilmAndTVIndustry = 1116,
	FilmAndTVAwards = 1108,
	FilmAndTVProduction = 1117,
	RecordingIndustry = 1115,
	MusicAwards = 1113,
	RecordLabels = 1114,
	EventsAndListings = 569,
	ClubsAndNightlife = 188,
	ConcertsAndMusicFestivals = 891,
	FilmFestivals = 1086,
	LiveSportingEvents = 1273,
	MovieListingsAndTheaterShowtimes = 1085,
	TicketSales = 614,
	FunAndTrivia = 539,
	DressUpAndFashionGames = 1173,
	FlashBasedEntertainment = 447,
	FunTestsAndSillySurveys = 1174,
	Humor = 182,
	ComedyFilms = 1095,
	LiveComedy = 895,
	PoliticalHumor = 1180,
	SpoofsAndSatire = 1244,
	TVComedies = 1047,
	Movies = 34,
	ActionAndAdventureFilms = 1097,
	MartialArtsFilms = 1101,
	SuperheroFilms = 1100,
	WesternFilms = 1099,
	BollywoodAndSouthAsianFilm = 360,
	ClassicFilms = 1102,
	SilentFilms = 1098,
	CultAndIndieFilms = 1103,
	DocumentaryFilms = 1072,
	DramaFilms = 1094,
	DVDAndVideoShopping = 210,
	DVDAndVideoRentals = 1145,
	FamilyFilms = 1291,
	HorrorFilms = 615,
	MovieMemorabilia = 213,
	MovieReference = 1106,
	MovieReviewsAndPreviews = 1107,
	MusicalFilms = 1105,
	RomanceFilms = 1310,
	ScienceFictionAndFantasyFilms = 616,
	ThrillerCrimeAndMysteryFilms = 1096,
	MusicAndAudio = 35,
	CDAndAudioShopping = 217,
	ClassicalMusic = 586,
	Opera = 1185,
	CountryMusic = 587,
	DanceAndElectronicMusic = 588,
	ExperimentalAndIndustrialMusic = 1022,
	FolkAndTraditionalMusic = 1023,
	JazzAndBlues = 589,
	Blues = 1040,
	Jazz = 42,
	LatinPop = 1285,
	MusicArtAndMemorabilia = 218,
	MusicEducationAndInstruction = 1087,
	MusicEquipmentAndTechnology = 1024,
	DJResourcesAndEquipment = 1025,
	MusicRecordingTechnology = 1026,
	MusicalInstruments = 216,
	DrumsAndPercussion = 1327,
	Guitars = 1325,
	PianosAndKeyboards = 1326,
	SamplesAndSoundLibraries = 1091,
	MusicReference = 1027,
	MusicCompositionAndTheory = 1028,
	SheetMusic = 892,
	SongLyricsAndTabs = 617,
	MusicStreamsAndDownloads = 220,
	PopMusic = 1021,
	Radio = 215,
	Podcasting = 809,
	TalkRadio = 1186,
	ReligiousMusic = 1020,
	ChristianAndGospelMusic = 585,
	RockMusic = 590,
	ClassicRockAndOldies = 1037,
	HardRockAndProgressive = 1035,
	IndieAndAlternativeMusic = 1038,
	MetalMusic = 1036,
	PunkMusic = 1041,
	Soundtracks = 893,
	UrbanAndHipHop = 592,
	RapAndHipHop = 1030,
	Reggaeton = 1242,
	SoulAndRB = 1039,
	VocalsAndShowTunes = 618,
	WorldMusic = 593,
	AfricanMusic = 1208,
	ArabAndMiddleEasternMusic = 1034,
	EastAsianMusic = 1033,
	LatinAmericanMusic = 591,
	BrazilianMusic = 1287,
	SalsaAndTropicalMusic = 1286,
	ReggaeAndCaribbeanMusic = 1031,
	SouthAsianMusic = 1032,
	Offbeat = 33,
	EdgyAndBizarre = 538,
	OccultAndParanormal = 449,
	OnlineMedia = 613,
	OnlineGames = 105,
	MassiveMultiplayer = 935,
	OnlineImageGalleries = 1222,
	PhotoAndImageSharing = 978,
	PhotoRatingSites = 320,
	StockPhotography = 574,
	OnlineVideo = 211,
	VideoSharing = 979,
	WebPortals = 301,
	WebcamsAndVirtualTours = 575,
	PerformingArts = 23,
	ActingAndTheater = 894,
	BroadwayAndMusicalTheater = 1243,
	Dance = 581,
	TVAndVideo = 36,
	TVCommercials = 1055,
	TVGuidesAndReference = 1187,
	TVNetworksAndStations = 359,
	TVShowsAndPrograms = 358,
	TVDramas = 1193,
	TVCrimeAndLegalShows = 1111,
	TVMedicalShows = 1194,
	TVSoapOperas = 357,
	TVFamilyOrientedShows = 1110,
	TVGameShows = 1050,
	TVRealityShows = 1049,
	TVSciFiAndFantasyShows = 1112,
	TVTalkShows = 1048,
	VisualArtAndDesign = 24,
	Architecture = 477,
	ArtAndCraftSupplies = 1361,
	ArtsEducation = 1195,
	Design = 653,
	CADAndCAM = 1300,
	GraphicDesign = 654,
	IndustrialAndProductDesign = 655,
	InteriorDesign = 656,
	Painting = 1167,
	PhotographicAndDigitalArts = 439,
	CameraAndPhotoEquipment = 573,
	BinocularsTelescopesAndOpticalDevices = 1384,
	CamerasAndCamcorders = 306,
	Camcorders = 308,
	CameraLenses = 1383,
	Cameras = 307,
	PhotoAndVideoSoftware = 577,
	VideoFileFormatsAndCodecs = 1315,
}

export enum ProductCategories {
	ConsumerResources = 69,
	ConsumerAdvocacyAndProtection = 97,
	CouponsAndDiscountOffers = 365,
	CustomerServices = 450,
	WarrantiesAndServiceContracts = 451,
	ProductReviewsAndPriceComparisons = 353,
	PriceComparisons = 352,
	ShoppingPortalsAndSearchEngines = 531,
	Apparel = 68,
	ApparelServices = 1228,
	AthleticApparel = 983,
	CasualApparel = 984,
	TShirts = 428,
	ChildrensClothing = 985,
	ClothingAccessories = 124,
	GemsAndJewelry = 350,
	HandbagsAndPurses = 986,
	Watches = 987,
	Costumes = 988,
	Eyewear = 989,
	Footwear = 697,
	FormalWear = 990,
	Headwear = 991,
	MensClothing = 992,
	Outerwear = 993,
	Sleepwear = 994,
	Swimwear = 995,
	Undergarments = 530,
	UniformsAndWorkwear = 996,
	WomensClothing = 997,
	Toys = 432,
	LuxuryGoods = 696,
	GiftsAndSpecialEventItems = 70,
	CardsAndGreetings = 100,
	Flowers = 323,
	PartyAndHolidaySupplies = 324,
	ShoppingPortalsAndSearchEnginesOther = 1210,
	Electronics = 5,
	Computers = 30,
	ConsumerElectronics = 78,
	Cameras = 307,
	Camcorders = 308,
	CameraLenses = 1383,
	CameraAndPhotoEquipment = 573,
	PhotoAndVideoSoftware = 577,
	ComputerHardware = 30,
	ComputerPeripherals = 312,
	ComputerComponents = 717,
	NetworkingEquipment = 346,
	GamingConsoles = 899,
	GadgetsAndPortableElectronics = 362,
	AudioEquipment = 361,
	TVAndVideoEquipment = 229,
	SmartPhones = 1071,
	MobileAndWirelessAccessories = 1171,
}

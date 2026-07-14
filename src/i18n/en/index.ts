import type { Translation } from '../i18n-types';

const siteNameShort = 'Data2Resilience';
const siteSubtitle = 'Dashboard for monitoring urban heat in Dortmund';
const en = {
	siteNameShort,
	author: 'Data2Resilience Team',
	siteSubtitle,
	siteNameLong: `${siteNameShort} | ${siteSubtitle}`,
	siteDescription:
		'Near real-time data on heat stress in Dortmund from research project Data2Resilience: Interactive maps and charts display current climate indicators such as temperature, humidity, and thermal comfort across different neighborhoods – clearly explained and accessible at any time.',
	keywords:
		'Data2Resilience, urban resilience, extreme heat, Dortmund, climate change, biometeorological measurement, community engagement, heat resilience, urban climate, climate adaptation, environmental monitoring, LoRaWAN, Smart City Dortmund',
	twitterHandle: 'RUBclim',
	log: "This log was called from '{fileName}'",
	themeColor: '#eff3f8',
	headImages: {
		og: {
			large: 'Screenshot of the Data2Resilience map dashboard',
			square: 'Logo of the Data2Resilience project'
		},
		twitter: 'Screenshot of the Data2Resilience map dashboard'
	},
	errors: {
		genericErrorLabel: 'Error',
		unexpectedError: {
			label: 'Unexpected error',
			description:
				"Oops, it looks like something unexpected has went wrong. We're sorry. Please try again or navigate to the homepage."
		},
		fourOhFour: {
			label: 'Page not found',
			description:
				"Oops, it looks like the page you were looking for doesn't exist. Don't worry, we can help you get back on track.",
			homepageLinkText: 'To the homepage'
		},
		unsupported: {
			unsupportedStation: 'Does not collect this data'
		},
		invalidExportConfig: 'Invalid export configuration'
	},
	generic: {
		expand: 'Know more',
		collapse: 'Collapse',
		dismiss: 'Dismiss',
		leftSidebar: {
			showAriaLabel: 'Expand left sidebar',
			hideAriaLabel: 'Collapse left sidebar'
		},
		hourInput: {
			label: 'Hour of the day',
			inputAriaLabel: 'Select hour of the day',
			buttonUpAriaLabel: 'Select an hour later',
			buttonDownAriaLabel: 'Select an hour earlier',
			nextHourInFuture: 'An hour in the future cannot be selected'
		},
		combobox: {
			selectOption: 'Select an optionOption auswählen',
			noResults: 'No results'
		},
		chartExportButtonLabel: 'Export chart'
	},
	themeSwitch: {
		light: 'Light',
		dark: 'Dark',
		system: 'System'
	},
	welcome: {
		title: 'Welcome to the Dashboard!',
		text: [
			'This interactive platform (dashboard) provides near real-time insight into how different locations in Dortmund are affected by heat. It is based on a city-wide network of sensors that continuously collect heat-related weather data.',
			'Clear maps and diagrams help visualize heat stress – for everyone looking to adapt to high temperatures, contribute to a more climate-resilient city, or simply stay informed.'
		],
		buttons: {
			confirm: "Understood, let's go",
			launchTour: 'Start the tour'
		},
		expandButtonLabel: 'Show the introduction message again',
		tourSteps: {
			buttons: {
				next: 'Next',
				prev: 'Back',
				cancel: 'Cancel',
				last: 'Finish',
				restart: 'Restart tour'
			},
			progress: '{currentStep}/{totalSteps}',
			welcome: {
				title: 'Welcome to the dashboard introduction!',
				text: 'In this short interactive tour, you will learn how to navigate the dashboard and use its key features.<br><br>You can cancel the tour at any time by simply clicking "Cancel".'
			},
			navigation: {
				title: 'Navigation overview',
				text: 'In the left sidebar, you will find all topics of the dashboard. You can choose between Measurements, Heat atlas, and Weather stations. Each section offers specific information and interactive features.'
			},
			measurements: {
				title: 'Selecting measurement data',
				text: 'Weather data is available for various locations across Dortmund.<br><br>Use the text field at the top to search for a measurement station by entering letters or selecting from the list.<br><br>In the dropdown menu below, you can choose the desired climate indicators (e.g., universal climate index UTCI, air temperature, relative humidity) and the corresponding unit.'
			},
			datavisType: {
				title: 'Choosing time period and statistical display',
				text: 'At the bottom timeline, you can adjust the displayed time period by dragging the yellow marker, or by selecting whether data is shown per hour, per day, or across a custom time range.<br><br>For daily values, you can additionally select how the data is displayed — for example, as minimum, average, or maximum — using the buttons at the top right corner.'
			},
			visualisation: {
				title: 'Comparing measurement data at a glance',
				text: 'In the upper chart, you can view the measurements for the selected stations within the chosen time period.<br><br>Below, a second chart displays the frequency distribution of specific values across Dortmund. Clicking on a bar will automatically highlight all stations with similar values.'
			},
			map: {
				title: 'Using the interactive map',
				text: 'Use the map view to explore locations visually or to select measurement stations (shown as points on the map).<br><br>You can click individual stations, zoom into the map, or search for specific addresses using the search bar at the top right.<br><br>Additional background layers, such as district boundaries or aerial imagery, can be toggled on or off using the controls at the top right.<br><br>The color of the stations automatically adapts to the selected climate indicator.<br><br>You can find the color legend at the bottom left — where you will also find information on potential health risks, for example related to the universal thermal climate index (UTCI).'
			},
			heatStress: {
				title: 'Exploring the heat atlas',
				text: 'The Heat Atlas shows how strongly different parts of the city are affected by heat stress.<br><br>You can switch between three climate variables: universal thermal climate index (UTCI), relative humidity, or air temperature.<br><br>For UTCI, you can toggle between a health-related heat stress map (showing heat stress categories) and a temperature map in degrees Celsius (temperature in °C).<br><br>The color coding and legend help you correctly interpret the intensity of heat exposure.'
			},
			stationsTable: {
				title: 'Learning more about weather stations',
				text: 'Here you will find technical information about all weather stations. In the table on the right, you can search for specific entries using the search bar at the top right. Clicking on a column header allows you to sort the table by that column. Measurement data can be downloaded for each station via the "Data" column.<br><br><strong>Tour completed:</strong><br>You now know the most important functions of the dashboard. Enjoy exploring the data!'
			}
		}
	},
	navigation: {
		backToHome: 'Back to the homepage',
		header: {
			about: 'About this dashboard'
		},
		aboutModal: {
			backToHome: 'Back to the homepage'
		},
		tabs: {
			actualMeasurements: 'Measurements',
			heatStress: 'Heat atlas',
			stations: 'Weather stations'
		}
	},
	pages: {
		heatStress: {
			title: 'How warm does the city feel?',
			intro: [
				'The Heat Atlas provides a city-wide overview of heat stress in Dortmund. You can choose between three climate indicators: the Universal Thermal Climate Index (UTCI), relative humidity, and air temperature.',
				'For UTCI, you can switch between a health-based heat stress map (heat stress categories) and a temperature map showing the perceived temperature in degrees Celsius (temperature in °C). A color scale and legend help to interpret the values. ',
				'These maps are based on modeled calculations derived from measured station data. The most recent available values within a four-hour time window are included. For more precise analyses, we recommend using the direct measurements from the stations.'
			],
			timeRangeAlert: 'Data only available from {startDate} to {endDate}.',
			timeRangeAlertTooltipTitle: 'This map is only available for the last 30 days.',
			timeRangeAlertTooltipContent:
				'The data requires a large amount of storage space, therefore this map is only available for the last 30 days.',
			singleDateAlertTitle: 'You are viewing data from {date}.',
			singleDateAlertTitleHoursAgo: '(from {dist} hours ago)',
			singleDateAlertTitleDaysAgo: '(from {dist} days ago)',
			singleDateAlertDescription:
				'The raster data displayed on the map represents the most recent processable data.',
			singleDateAlertDescriptionActualData:
				'Currently, the displayed data is up-to-date and at most 2 hours old.',
			singleDateAlertDescriptionOldDataHours:
				'Currently, the displayed data is {dist} hours old. In winter and with expensive processing, the data may be significantly outdated.',
			singleDateAlertDescriptionOldDataDays:
				'Currently, the displayed data is {dist} days old. In winter and with expensive processing, the data may be significantly outdated.',
			indicatorsNavAriaLabel: 'Select an indicator to change the data displayed on the map.'
		},
		measurements: {
			title: 'What is being measured?',
			intro: [
				'In various parts of Dortmund, measurement stations continuously record weather data such as air temperature, humidity, and solar radiation. This information helps to better understand current heat stress in the city.',
				'The stations are displayed as points on the map. You can select individual stations, choose specific climate indicators, and adjust the time period displayed. The corresponding diagrams allow for comparisons across locations and time spans.',
				'Use the interactive map on the right for orientation. Additional layers such as aerial imagery or health risk information can be displayed to enrich the view.'
			],
			noDataAvailable: 'No data available for the selected configuration',
			noValueMeasured: 'No value measured',
			noStationsSelected: 'Select at least one station to display its data',
			someUnsupportedStations:
				'The stations <strong>{stations}</strong> do not collect data for the selected indicator <strong>{unit}</strong>.',
			allUnsupportedStations:
				'None of the selected stations collect data for the indicator <strong>{unit}</strong>.',
			singleUnsupportedStation:
				'The station <strong>{station}</strong> does not collect data for the indicator <strong>{unit}</strong>.',
			singleUnsupportedStationShort:
				'This station does not collect data for the indicator <strong>{unit}</strong>.',
			someStationsWithoutAvailableData:
				'The stations <strong>{stations}</strong> have no available data for the indicator <strong>{unit}</strong>, and the current time configuration.',
			allStationsWithoutAvailableData:
				'None of the selected stations have data available for the indicator <strong>{unit}</strong>, and the current time configuration.',
			singleStationWithoutAvailableData:
				'The station <strong>{station}</strong> has no data available for the indicator <strong>{unit}</strong>, and the current time configuration.',
			stationsSelect: {
				placeholder: 'Select one or more stations',
				label: 'Selected stations'
			},
			unitSelect: {
				noUnitFound: 'No climate indicator found',
				placeholder: 'Select a climate indicator',
				searchPlaceholder: 'Search climate indicator...',
				xOutOfY: '{part} of {total} stations',
				stationsHeaderLabel: 'Station name',
				units: {
					utci_max: {
						label: 'Maximum Universal Thermal Climate Index (UTCI)',
						description:
							'The <strong>Maximum Universal Thermal Climate Index (UTCI)</strong> describes the highest recorded UTCI during a specific time period.',
						unitOnly: '°C'
					},
					utci_min: {
						label: 'Minimum Universal Thermal Climate Index (UTCI)',
						description:
							'The <strong>Minimum Universal Thermal Climate Index (UTCI)</strong> describes the lowest recorded UTCI during a specific time period.',
						unitOnly: '°C'
					},
					utci: {
						label: 'Universal thermal climate index (UTCI)',
						description:
							'The <strong>universal thermal climate index (UTCI)</strong> describes how warm the weather feels to the human body. It takes into account air temperature, wind speed, solar radiation, and humidity. Results are expressed as a perceived temperature in degrees Celsius (°C). Calculations assume an average person wearing seasonally appropriate clothing while walking outdoors. ',
						unitOnly: '°C'
					},
					utci_category: {
						label: 'Universal thermal climate index (UTCI) category',
						description:
							'The <strong>UTCI category</strong> describes how warm the weather feels to the human body. It takes into account air temperature, wind speed, solar radiation, and humidity. Results are expressed in stress categories for the human body (heat stress). Calculations assume an average person wearing seasonally appropriate clothing while walking outdoors.',
						unitOnly: ''
					},
					absolute_humidity_max: {
						label: 'Maximum absolute humidity',
						description:
							'The <strong>maximum absolute humidity</strong> describes the highest amount of water vapor in the air, measured in grams per cubic meter.',
						unitOnly: 'g/m³'
					},
					absolute_humidity_min: {
						label: 'Minimum absolute humidity',
						description:
							'The <strong>minimum absolute humidity</strong> describes the lowest amount of water vapor in the air, measured in grams per cubic meter.',
						unitOnly: 'g/m³'
					},
					absolute_humidity: {
						label: 'Absolute humidity',
						description:
							'The <strong>absolute humidity</strong> indicates the actual amount of water vapor in the air, measured in grams per cubic meter (g/m³). High absolute humidity reduces the body’s ability to cool through sweating, making the heat feel more oppressive.',
						unitOnly: 'g/m³'
					},
					air_temperature_max: {
						label: 'Maximum air temperature',
						description:
							'The <strong>maximum air temperature</strong> describes the highest recorded temperature of the surrounding air in degrees Celsius.',
						unitOnly: '°C'
					},
					air_temperature_min: {
						label: 'Minimum air temperature',
						description:
							'The <strong>minimum air temperature</strong> describes the lowest recorded temperature of the surrounding air in degrees Celsius.',
						unitOnly: '°C'
					},
					air_temperature: {
						label: 'Air temperature',
						description:
							'The <strong>air temperature</strong> measures the actual temperature of the air, in degrees Celsius (°C). It is a key factor in perceived heat stress – the higher the air temperature, the greater the burden on the human body.',
						unitOnly: '°C'
					},
					atmospheric_pressure_max: {
						label: 'Maximum atmospheric pressure',
						description:
							'The <strong>maximum atmospheric pressure</strong> describes the highest force exerted by the weight of air in the atmosphere, measured in hectopascals.',
						unitOnly: 'hPa'
					},
					atmospheric_pressure_min: {
						label: 'Minimum atmospheric pressure',
						description:
							'The <strong>minimum atmospheric pressure</strong> describes the lowest force exerted by the weight of air in the atmosphere, measured in hectopascals.',
						unitOnly: 'hPa'
					},
					atmospheric_pressure_reduced_max: {
						label: 'Maximum reduced atmospheric pressure',
						description:
							'The <strong>maximum reduced atmospheric pressure</strong> describes the highest sea-level adjusted pressure, measured in hectopascals.',
						unitOnly: 'hPa'
					},
					atmospheric_pressure_reduced_min: {
						label: 'Minimum reduced atmospheric pressure',
						description:
							'The <strong>minimum reduced atmospheric pressure</strong> describes the lowest sea-level adjusted pressure, measured in hectopascals.',
						unitOnly: 'hPa'
					},
					atmospheric_pressure_reduced: {
						label: 'Reduced atmospheric pressure',
						description:
							'The <strong>reduced atmospheric pressure</strong> is the atmospheric pressure adjusted to sea level, allowing for comparable readings independent of elevation. It is measured in hectopascals (hPa).',
						unitOnly: 'hPa'
					},
					atmospheric_pressure: {
						label: 'Atmospheric pressure',
						description:
							'The <strong>atmospheric pressure</strong> measures the weight of the air column above a location, expressed in hectopascals (hPa). While it only indirectly affects heat perception, high-pressure systems often contribute to hot, stable weather conditions.',
						unitOnly: 'hPa'
					},
					dew_point_max: {
						label: 'Maximum dew point',
						description:
							'The <strong>maximum dew point</strong> describes the highest temperature at which air is saturated with water vapor, measured in degrees Celsius.',
						unitOnly: '°C'
					},
					dew_point_min: {
						label: 'Minimum dew point',
						description:
							'The <strong>minimum dew point</strong> describes the lowest temperature at which air is saturated with water vapor, measured in degrees Celsius.',
						unitOnly: '°C'
					},
					dew_point: {
						label: 'Dew point',
						description:
							'The <strong>dew point</strong> is the temperature at which the air becomes saturated with water vapor, causing condensation – measured in degrees Celsius (°C). A high dew point signals very humid air, which hampers sweating and increases heat stress.',
						unitOnly: '°C'
					},
					heat_index_max: {
						label: 'Maximum heat index',
						description:
							'The <strong>maximum heat index</strong> describes the highest perceived temperature based on air temperature and humidity.',
						unitOnly: '°C'
					},
					heat_index_min: {
						label: 'Minimum heat index',
						description:
							'The <strong>minimum heat index</strong> describes the lowest perceived temperature based on air temperature and humidity.',
						unitOnly: '°C'
					},
					heat_index: {
						label: 'Heat index',
						description:
							'The <strong>heat index</strong> combines air temperature and relative humidity to describe how hot it feels to the human body – shown in degrees Celsius (°C). It is particularly useful for assessing discomfort in humid conditions.',
						unitOnly: '°C'
					},
					lightning_average_distance_max: {
						label: 'Maximum average lightning distance',
						description:
							'The <strong>maximum average lightning distance</strong> describes the greatest mean distance of lightning strikes from a reference point, measured in meters.',
						unitOnly: 'km'
					},
					lightning_average_distance_min: {
						label: 'Minimum average lightning distance',
						description:
							'The <strong>minimum average lightning distance</strong> describes the smallest mean distance of lightning strikes from a reference point, measured in meters.',
						unitOnly: 'km'
					},
					lightning_average_distance: {
						label: 'Average lightning distance',
						description:
							'The <strong>average lightning distance</strong> shows the average distance of recorded lightning strikes from the selected location, measured in meters. While it does not directly affect heat perception, it can signal upcoming weather changes after a heat period.',
						unitOnly: 'km'
					},
					lightning_strike_count_max: {
						label: 'Maximum number of lightning strikes',
						description:
							'The <strong>maximum number of lightning strikes</strong> describes the highest number of times lightning has struck within a given area and time period.',
						unitOnly: ''
					},
					lightning_strike_count_min: {
						label: 'Minimum number of lightning strikes',
						description:
							'The <strong>minimum number of lightning strikes</strong> describes the lowest number of times lightning has struck within a given area and time period.',
						unitOnly: ''
					},
					lightning_strike_count: {
						label: 'Number of lightning strikes',
						description:
							'The <strong>number of lightning strikes</strong> shows the absolute number of lightning strikes recorded in a certain time frame and area. While lightning itself does not directly influence heat perception, it can indicate strong thunderstorms following intense heat.',
						unitOnly: ''
					},
					maximum_wind_speed_max: {
						label: 'Maximum maximum wind speed',
						description:
							'The <strong>maximum maximum wind speed</strong> describes the highest recorded wind speed during a specific time period.',
						unitOnly: 'm/s'
					},
					maximum_wind_speed_min: {
						label: 'Minimum maximum wind speed',
						description:
							'The <strong>minimum maximum wind speed</strong> describes the lowest recorded wind speed during a specific time period.',
						unitOnly: 'm/s'
					},
					maximum_wind_speed: {
						label: 'Maximum wind speed',
						description:
							'The <strong>maximum wind speed</strong> is the highest recorded wind speed during a given time period, measured in meters per second (m/s). Higher wind speeds can reduce heat stress by enhancing cooling through evaporation.',
						unitOnly: 'm/s'
					},
					mrt_max: {
						label: 'Mean radiant temperature',
						description:
							'The <strong>maximum mean radiant temperature</strong> describes the highest average temperature of surrounding surfaces that emit radiant heat.',
						unitOnly: '°C'
					},
					mrt_min: {
						label: 'Mean radiant temperature',
						description:
							'The <strong>minimum mean radiant temperature</strong> describes the lowest average temperature of surrounding surfaces that emit radiant heat.',
						unitOnly: '°C'
					},
					mrt: {
						label: 'Mean radiant temperature',
						description:
							'The <strong>mean radiant temperature</strong> describes the combined effect of all thermal radiation a person is exposed to – from sunlight, heated walls, streets, and the sky – and is measured in degrees Celsius (°C).',
						unitOnly: '°C'
					},
					pet_category: {
						label: 'Physiological equivalent temperature (PET) category',
						description:
							'The <strong>PET category</strong> reflects the air temperature at which a person would feel equally warm or cold indoors (without wind or solar radiation) as under current outdoor conditions. It accounts for temperature, humidity, wind, and radiation and is measured in stress categories for the human body (heat stress).',
						unitOnly: ''
					},
					pet_max: {
						label: 'Maximum physiological equivalent temperature (PET)',
						description:
							'The <strong>maximum physiological equivalent temperature (PET)</strong> describes the highest recorded PET during a specific time period.',
						unitOnly: '°C'
					},
					pet_min: {
						label: 'Minimum physiological equivalent temperature (PET)',
						description:
							'The <strong>minimum physiological equivalent temperature (PET)</strong> describes the lowest recorded PET during a specific time period.',
						unitOnly: '°C'
					},
					pet: {
						label: 'Physiological equivalent temperature (PET)',
						description:
							'The <strong>physiological equivalent temperature (PET)</strong> reflects the air temperature at which a person would feel equally warm or cold indoors (without wind or solar radiation) as under current outdoor conditions. It accounts for temperature, humidity, wind, and radiation and is measured in degrees Celsius (°C).',
						unitOnly: '°C'
					},
					precipitation_sum_max: {
						label: 'Maximum precipitation sum',
						description:
							'The <strong>maximum precipitation sum</strong> describes the highest amount of water falling from the sky as rain, snow, or other forms, measured in millimeters.',
						unitOnly: 'mm'
					},
					precipitation_sum_min: {
						label: 'Minimum precipitation sum',
						description:
							'The <strong>minimum precipitation sum</strong> describes the lowest amount of water falling from the sky as rain, snow, or other forms, measured in millimeters.',
						unitOnly: 'mm'
					},
					precipitation_sum: {
						label: 'Precipitation',
						description:
							'The <strong>precipitation</strong> records the total amount of rain, snow, or other forms of water that fall in a given time period, measured in millimeters (mm). Rain can reduce heat stress by cooling the air and increasing cloud cover and wind.',
						unitOnly: 'mm'
					},
					relative_humidity_max: {
						label: 'Maximum relative humidity',
						description:
							'The <strong>maximum relative humidity</strong> describes the highest amount of water vapor in the air compared to the maximum amount it could hold at that temperature.',
						unitOnly: '%'
					},
					relative_humidity_min: {
						label: 'Minimum relative humidity',
						description:
							'The <strong>minimum relative humidity</strong> describes the lowest amount of water vapor in the air compared to the maximum amount it could hold at that temperature.',
						unitOnly: '%'
					},
					relative_humidity: {
						label: 'Relative humidity',
						description:
							'The <strong>relative humidity</strong> shows how much moisture is in the air compared to the maximum amount it could hold at the current temperature – expressed as a percentage (%). High relative humidity reduces the evaporation of sweat, making the heat feel more intense. ',
						unitOnly: '%'
					},
					solar_radiation_max: {
						label: 'Maximum solar radiation',
						description:
							'The <strong>maximum solar radiation</strong> describes the highest amount of energy received from the sun per unit area, measured in watts per square meter.',
						unitOnly: 'W/m²'
					},
					solar_radiation_min: {
						label: 'Minimum solar radiation',
						description:
							'The <strong>minimum solar radiation</strong> describes the lowest amount of energy received from the sun per unit area, measured in watts per square meter.',
						unitOnly: 'W/m²'
					},
					solar_radiation: {
						label: 'Solar radiation',
						description:
							'The <strong>solar radiation</strong> measures the sun’s energy reaching a given surface, expressed in watts per square meter (W/m²). It includes visible light, ultraviolet (UV), and infrared radiation and is the main source of heating in the environment.',
						unitOnly: 'W/m²'
					},

					vapor_pressure_max: {
						label: 'Maximum vapor pressure',
						description:
							'The <strong>maximum vapor pressure</strong> describes the highest pressure exerted by water vapor in the air, measured in hectopascals.',
						unitOnly: 'hPa'
					},
					vapor_pressure_min: {
						label: 'Minimum vapor pressure',
						description:
							'The <strong>minimum vapor pressure</strong> describes the lowest pressure exerted by water vapor in the air, measured in hectopascals.',
						unitOnly: 'hPa'
					},
					vapor_pressure: {
						label: 'Vapor pressure',
						description:
							'The <strong>vapor pressure</strong> represents the portion of the total air pressure exerted by the water vapor in the air, measured in hectopascals (hPa). High vapor pressure signals high humidity, which makes it harder for sweat to evaporate, increasing heat stress.',
						unitOnly: 'hPa'
					},
					wet_bulb_temperature_max: {
						label: 'Maximum wet bulb temperature',
						description:
							'The <strong>maximum wet bulb temperature</strong> describes the highest temperature a thermometer would read if it were covered with a wet cloth and exposed to the air.',
						unitOnly: '°C'
					},
					wet_bulb_temperature_min: {
						label: 'Minimum wet bulb temperature',
						description:
							'The <strong>minimum wet bulb temperature</strong> describes the lowest temperature a thermometer would read if it were covered with a wet cloth and exposed to the air.',
						unitOnly: '°C'
					},
					wet_bulb_temperature: {
						label: 'Wet bulb temperature',
						description:
							'The <strong>wet bulb temperature</strong> indicates the lowest temperature achievable through evaporative cooling under given conditions. It is an important measure for how efficiently the body can cool itself through sweating.',
						unitOnly: '°C'
					},
					wind_direction_max: {
						label: 'Maximum wind direction',
						description:
							'The <strong>maximum wind direction</strong> describes the highest recorded direction from which the wind is blowing, measured in degrees.',
						unitOnly: '°'
					},
					wind_direction_min: {
						label: 'Minimum wind direction',
						description:
							'The <strong>minimum wind direction</strong> describes the lowest recorded direction from which the wind is blowing, measured in degrees.',
						unitOnly: '°'
					},
					wind_direction: {
						label: 'Wind direction',
						description:
							'The <strong>wind direction</strong> indicates where the wind is coming from, measured in degrees (°) – with 0° representing north, 90° east, 180° south, and 270° west. Wind direction can influence whether warmer or cooler air masses are moved into an area.',
						unitOnly: '°'
					},
					wind_speed_max: {
						label: 'Maximum wind speed',
						description:
							'The <strong>maximum wind speed</strong> describes the highest rate of air movement recorded during a specific time period.',
						unitOnly: 'm/s'
					},
					wind_speed_min: {
						label: 'Minimum wind speed',
						description:
							'The <strong>minimum wind speed</strong> describes the lowest rate of air movement recorded during a specific time period.',
						unitOnly: 'm/s'
					},
					wind_speed: {
						label: 'Wind speed',
						description:
							'The <strong>wind speed</strong> describes how fast the air is moving, measured in meters per second (m/s). Higher wind speeds can help cool the body by improving sweat evaporation.',
						unitOnly: 'm/s'
					}
				}
			},
			minMaxAvgSelect: {
				min: 'Minimum',
				avg: 'Average',
				max: 'Maximum'
			},
			dateRangeSlider: {
				today: 'Today',
				day: 'Per day',
				hour: 'Per hour',
				range: 'Time range',
				infoTitle: 'How does the time selection work?',
				infoDescription:
					'You can choose how the climate data is displayed in the chart by using the buttons "per hour", "per day", and "time range":<ul class="flex flex-col gap-1 py-2"><li><strong>Per hour:</strong> Displays hourly values for selected days.</li></li><strong>Per day:</strong> Displays daily minimum, average, or maximum values.</li></li><strong>Time range:</strong> Displays the trend between two freely selectable points in time.<li></ul>Only one chart is shown at a time and automatically adjusts to your selection.'
			},
			histogram: {
				title: 'Overview of all stations',
				tooltip: {
					numberic:
						'There {{is|are}} <strong>{count}</strong> station{{s}} with values between <strong>{start} {unit}</strong> and <strong>{end} {unit}</strong>.',
					category:
						'There {{is|are}} <strong>{count}</strong> station{{s}} values in the category <strong>{category}</strong>.',
					stations: `Including the following {{|selected station|?? selected stations}}:`,
					clickToSelect: `Click to select {{|the station|?? stations}}.`
				}
			}
		},
		stations: {
			title: 'How do we measure urban heat?',
			titleTable: 'Overview of all stations',
			intro: [
				'Learn more about the technical equipment and site selection of the measurement stations. Two types of stations are used to collect data: basic stations and advanced stations.',
				'In the table to the right, you will find more detailed information about each station location. You can also download all measurement data recorded since the beginning of 2024 for each station. Use the search field at the top right to quickly find entries, such as station names or locations.',
				'Further details about the two station types and the criteria for selecting station locations are provided in the sections below.'
			],
			stationsDescriptions: {
				measuredIndicatorsLabel: 'Supported indicators',
				calculatedIndicatorsLabel: 'Calculated indicators',
				weather: {
					title: 'Advanced Stations',
					description:
						'The more extensively equipped stations (DL-ATM41 and Black-Globe Sensor by Campbell Scientific) measure:',
					calculatedDescription:
						'A total of 25 advanced stations have been installed. From these measurements, additional important indices can be derived.',
					measuredIndicators: [
						'air_temperature',
						'atmospheric_pressure',
						'lightning_average_distance',
						'lightning_strike_count',
						'maximum_wind_speed',
						'mrt',
						'precipitation_sum',
						'relative_humidity',
						'solar_radiation',
						'vapor_pressure',
						'wind_direction',
						'wind_speed'
					],
					calculatedIndicators: [
						'absolute_humidity',
						'atmospheric_pressure_reduced',
						'dew_point',
						'heat_index',
						'specific_humidity',
						'pet_category',
						'pet',
						'utci_category',
						'utci',
						'wet_bulb_temperature'
					]
				},
				airTemperatureAndHumidity: {
					title: 'Basic Stations',
					description: 'These compact stations (DL-SHT35 by Decentlab) measure:',
					calculatedDescription:
						'A total of 56 basic stations have been installed. From the collected data, additional climate indicators can be calculated.',
					measuredIndicators: ['air_temperature', 'relative_humidity'],
					calculatedIndicators: [
						'absolute_humidity',
						'dew_point',
						'heat_index',
						'specific_humidity',
						'wet_bulb_temperature'
					]
				}
			},
			stationsSelectionSection: {
				title: 'Selection of Station Locations',
				description:
					'Station locations were selected based on geostatistical analyses and in close cooperation with the City of Dortmund. Factors considered included local climate zones, urban structure, topography, population density, and aspects of climate justice. All stations are mounted on city-owned lamp posts and transmit data via LoRaWAN – an energy-efficient wireless network designed for transmitting small data packets over long distances.'
			},
			table: {
				search: {
					placeholder: 'Search...',
					label: 'Search table'
				},
				headers: {
					name: 'Station name',
					stationType: 'Station type',
					id: 'ID',
					geolocation: 'Geolocation',
					district: 'District',
					installation_at: 'Installation at',
					status: 'Status',
					details: 'Details',
					dataDownload: 'Data',
					dataDownloadTooltip: 'Download raw data for this station',
					metadata: 'Metadata',
					metadataTooltip: 'Show metadata sheet for this station'
				},
				cells: {
					stationTypes: {
						biomet: 'Advanced Station',
						temprh: 'Basic Station'
					},
					status: {
						active: 'active',
						inactive: 'inactive'
					},
					coordinates: {
						googleMapsLinkText: 'Open in Google Maps',
						copyCoordinates: 'Copy to the clipboard',
						copiedToClipboard: 'Copied to the clipboard'
					}
				}
			}
		},
		about: {
			title: 'About this dashboard',
			description:
				"This interactive platform was developed as part of the Data2Resilience project – a joint research initiative by Ruhr University Bochum and Leibniz University Hannover. The goal is to better monitor heat stress in Dortmund and strengthen the city’s resilience to the impacts of climate change. The project combines scientific measurements, innovative technologies, and active citizen engagement. Data2Resilience is funded by the <a href='https://iclei.org/activity/iclei-action-fund-2-0/' target='_blank' rel='noopener noreferrer'>ICLEI Action Fund 2.0</a> with support from <a href='https://www.google.org/' target='_blank' rel='noopener noreferrer'>Google.org</a>.",

			mainLink: {
				url: `https://dortmund.de/hitze`,
				label: 'dortmund.de/hitze'
			},
			contactLink: {
				url: `mailto:climate@rub.de`,
				label: 'Write us an email'
			},
			links: [
				{
					label: 'imprint',
					url: '/imprint'
				},
				{
					label: 'privacy policy',
					url: '/privacy-policy'
				}
			],
			logos: {
				RUB: {
					title: 'Logo of the Ruhr University Bochum (RUB)',
					url: 'https://www.ruhr-uni-bochum.de/en/'
				},
				LUH: {
					title: 'Logo of Leibniz University Hannover (LUH)',
					url: 'https://www.uni-hannover.de/'
				},
				ICLEI: {
					title: 'Logo of the Local Government for Sustainability EUROPE (ICLEI)',
					url: 'https://iclei.org/'
				},
				googleOrg: {
					title: 'Logo of Google.org',
					url: 'https://www.google.org/'
				}
			}
		},
		imprint: {
			title: 'Imprint',
			content:
				'<p>Ruhr University Bochum is a public corporation under German law. It is legally represented by its Rector, Professor Dr. Dr. h. c. Martin Paul.</p><p>The responsible supervisory authority is:</p><p>Ministry of Innovation, Science and Research of the State of North Rhine-Westphalia<br /> V&ouml;lklinger Stra&szlig;e 49<br /> 40221 D&uuml;sseldorf, Germany</p><p>VAT Identification Number of Ruhr University Bochum: DE 127 056 261</p><p>Content responsibility for the dashboard lies with the Institute of Geography at Ruhr University Bochum.</p><h2>Executive Director of the Institute of Geography</h2><p>Prof. Dr. Benjamin Bechtel<br /> Building IA 6/97<br /> Universit&auml;tsstra&szlig;e 150<br /> 44801 Bochum, Germany</p><h2>Legal Notice</h2><p>Unless otherwise stated, all texts, layouts, and images on the pages of this dashboard referring to this imprint are the intellectual property of the Institute of Geography at Ruhr University Bochum. These contents are protected under copyright law and are provided under the terms of the CC BY 4.0 license, unless otherwise indicated.</p><p>While the contents of this dashboard have been created with the utmost care, the Institute of Geography at Ruhr University Bochum assumes no liability for the correctness, completeness, or current relevance of the information. The same applies to the content of linked external websites.</p>'
		},
		privacy: {
			title: 'Privacy Policy',
			content:
				'<p>Below we inform you about the processing of personal data when using the online platform https://data-2-resilience.vercel.app/. Personal data refers to any information that can be related to you personally. Other websites of Ruhr University Bochum may be subject to different privacy policies. The controller pursuant to the General Data Protection Regulation (GDPR) and the Data Protection Act of North Rhine-Westphalia (NRW) is: Ruhr University Bochum, Universit&auml;tsstra&szlig;e. 150, 44780 Bochum, Germany</p><p>Responsible department: Institute of Geography<br /> Kontaktinfos DSB<br /> Data Protection Officer of Ruhr University Bochum<br /> Dr. Kai-Uwe Loser<br /> dsb@rub.de</p><h2>Description and Scope of Data Processing</h2><p>Each time you access our dashboard, certain data is required for technical reasons to provide the service (legal basis: Art. 6(1)(e) GDPR). The following data is processed:</p><ul><li>Browser type and version</li><li>Operating system</li><li>IP address (anonymized immediately after the service is delivered)</li><li>Date and time of access</li><li>Referring website (from which the user&rsquo;s system accessed our page)</li></ul><p>These anonymized data are also stored in server log files. No data is stored together with other personal data of the user.</p><p>Processing of this data is technically necessary for the provision and operation of the dashboard. Therefore, users do not have the option to object.</p><h2>Use of Cookies</h2><p>Our website uses cookies. Cookies are small files stored in or by your browser on your device. We use cookies solely to preserve the user&rsquo;s language preferences. No identifying or tracking cookies are used on our website.</p><h2>Email Contact</h2><p>When you contact us via email, the data you provide (your email address and any additional information you include) will be processed and stored in order to respond to your inquiry. Such correspondence is retained by Ruhr University Bochum for 5 years (legal basis: Art. 6(1)(e) GDPR; retention in accordance with university policy).</p><h2>Your Rights as a Data Subject</h2><p>If your personal data is processed, you are considered a data subject under the GDPR and are entitled to the following rights:</p><p>You may request confirmation as to whether personal data concerning you is being processed. If this is the case, you can obtain information on the purposes of processing, the data itself, its origin, recipients (including international transfers), and the duration of storage.</p><p>You have the right to request the correction of inaccurate or incomplete data. Under certain conditions, you may also request the deletion of your data or restriction of processing. Voluntarily submitted data must be deleted if you withdraw your consent. If data has been shared with others, deletion also applies to those recipients, and we will inform you of who received your data.</p><p>For complaints, you may contact the responsible supervisory authority: State Commissioner for Data Protection NRW &ndash; https://ldi.nrw.de</p><p>You may also contact the Data Protection Officer of Ruhr University Bochum at dsb@rub.de. Further information is available at https://dsb.ruhr-uni-bochum.de/&nbsp;</p><h2>Embedded Services</h2><p>When loading the interactive map, connections are made to servers operated by OpenStreetMap. In doing so, technical data such as your IP address may be transmitted. For further information, please refer to the privacy policies of: https://wiki.osmfoundation.org/wiki/Privacy_Policy.</p><p>To display the interactive maps, this dashboard uses the open-source library MapLibre GL JS. The map data (so-called "tiles") is provided by a self-hosted tile server. When loading the map content, a connection is established to servers operated by Ruhr University Bochum. In the process, technical data such as your IP address, timestamp, and browser information may be transmitted to these servers. This data processing is necessary for the display of the map content and is carried out pursuant to Article 6(1)(e) GDPR (performance of a task carried out in the public interest). No data is shared with third parties.</p>'
		}
	},
	indicators: {
		utci: {
			title: 'Universal thermal climate index (UTCI)',
			description:
				'The UTCI describes how warm the weather feels to the human body. It takes into account air temperature, wind speed, solar radiation, and humidity. Results are expressed in stress levels for the human body (heat stress category) or as a perceived temperature in degrees Celsius (temperature in °C). Calculations assume an average person wearing seasonally appropriate clothing while walking outdoors. ',
			types: {
				byClass: {
					title: 'By heat stress category',
					description:
						'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes.'
				},
				byValue: {
					title: 'By temperature in °C',
					description:
						'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes.'
				}
			}
		},
		relative_humidity: {
			title: 'Relative humidity',
			description:
				'Shows how much moisture is in the air compared to the maximum amount it could hold at the current temperature – expressed as a percentage (%). High relative humidity reduces the evaporation of sweat, making the heat feel more intense. '
		},
		air_temperature: {
			title: 'Air temperature',
			description:
				'Shows the actual temperature of the air, in degrees Celsius (°C). It is a key factor in perceived heat stress – the higher the air temperature, the greater the burden on the human body.'
		}
	},
	map: {
		search: {
			label: 'Search location',
			placeholder: 'Enter a location...',
			loading: 'Searching for results...',
			noResults: 'No results found',
			tooltip: 'You searched for the following place',
			error: 'An error occurred while searching for results'
		},
		zoom: {
			navAlt: 'Zoom navigation',
			zoomIn: 'Zoom in',
			zoomOut: 'Zoom out'
		},
		layersSelection: {
			ariaLabel: 'Map layer selection',
			districts: 'City districts',
			districtsTooltip: {
				title: 'What are city districts?',
				description:
					'City districts are official administrative divisions of Dortmund, each with its own local council and responsibilities.'
			},
			lors: 'Neighborhoods<br/>& action areas',
			lorsTooltip: {
				title: 'What are neighborhoods and action areas?',
				description:
					"Neighborhoods are smaller units within the city districts. Action areas highlight zones with special social development needs, defined within Dortmund´s <a class='focusable transition-opacity hover-hover:hover:opacity-50 underline decoration-primary underline-offset-4' href='https://www.dortmund.de/themen/soziales/aktionsplan-soziale-stadt/' target='_blank' rel='noopener noreferrer'>Social City Action Plan</a>."
			},
			satellite: 'Digital Orthophotos',
			satelliteTooltip: {
				title: 'What are digital orthophotos?',
				description:
					'Digital orthophotos are corrected aerial photographs that serve as a true-to-scale map, providing a realistic bird´s-eye view of Dortmund.'
			},
			buildings: 'Buildings',
			buildingsTooltip: {
				title: 'Building footprints',
				description:
					'Show or hide building footprints on the map.'
			},
			streets: 'Streets',
			streetsTooltip: {
				title: 'Street Network',
				description: 'Toggle visibility of roads and street labels.'
			}
		},
		layersTooltips: {
			vulnerableArea: 'Action area',
			type: {
				stadtbezirk: 'City district',
				statistischer_bezirk: 'Neighborhood'
			}
		},
		choroplethLegend: {
			showHealthRisks: 'Show health risks',
			hideHealthRisks: 'Hide health risks',
			title: 'Health risks',
			notCollectingData: 'Does not collect data',
			noValueAvailable: 'No data available',
			withData: 'Data available',
			healthRisks: {
				'extreme cold stress': {
					title: {
						thermalComfort: 'Extremely cold',
						heatStress: 'Extreme cold stress'
					},
					description: 'Life-threatening hypothermia, severe frostbite possible within minutes.',
					ranges: {
						pet: '',
						utci: 'below -40 °C'
					}
				},
				'very strong cold stress': {
					title: {
						thermalComfort: 'Very cold',
						heatStress: 'Very strong cold stress'
					},
					description: 'High risk of frostbite, possible hypothermia.',
					ranges: {
						pet: 'below 4 °C',
						utci: '-40 to -27 °C'
					}
				},
				'strong cold stress': {
					title: {
						thermalComfort: 'Cold',
						heatStress: 'Strong cold stress'
					},
					description:
						'Risk of frostbite for exposed skin, increased risk of cold-related injuries.',
					ranges: {
						pet: '4 to 8 °C',
						utci: '-27 to -13 °C'
					}
				},
				'moderate cold stress': {
					title: {
						thermalComfort: 'Cool',
						heatStress: 'Moderate cold stress'
					},
					description: 'Shivering, discomfort, risk of frostbite with prolonged exposure.',
					ranges: {
						pet: '8 to 13 °C',
						utci: '-13 to 0 °C'
					}
				},
				'slight cold stress': {
					title: {
						thermalComfort: 'Slightly cool',
						heatStress: 'Slight cold stress'
					},
					description: 'Minor discomfort, temporary shivering.',
					ranges: {
						pet: '13 to 18 °C',
						utci: '0 to 9 °C'
					}
				},
				'no thermal stress': {
					title: {
						thermalComfort: 'Neutral',
						heatStress: 'No thermal stress'
					},
					description: 'Thermal comfort, no significant health risks.',
					ranges: {
						pet: '18 to 23 °C',
						utci: '9 to 26 °C'
					}
				},
				'moderate heat stress': {
					title: {
						thermalComfort: 'Slightly warm',
						heatStress: 'Moderate heat stress'
					},
					description: 'Minor discomfort, increased sweating.',
					ranges: {
						pet: '23 to 29 °C',
						utci: '26 to 32 °C'
					}
				},
				'strong heat stress': {
					title: {
						thermalComfort: 'Warm',
						heatStress: 'Strong heat stress'
					},
					description:
						'Increased strain on the cardiovascular system, risk of dehydration and exhaustion.',
					ranges: {
						pet: '29 to 35 °C',
						utci: '32 to 38 °C'
					}
				},
				'very strong heat stress': {
					title: {
						thermalComfort: 'Hot',
						heatStress: 'Very strong heat stress'
					},
					description:
						'Risk of heat cramps, heat exhaustion, increased risk of heat-related illnesses, especially during physical activity.',
					ranges: {
						pet: '35 to 41 °C',
						utci: '38 to 46 °C'
					}
				},
				'extreme heat stress': {
					title: {
						thermalComfort: 'Very hot',
						heatStress: 'Extreme heat stress'
					},
					description:
						'Life-threatening heat stroke possible, acute strain on the cardiovascular system, high risk of severe heat-related illnesses and death.',
					ranges: {
						pet: 'above 41 °C',
						utci: 'above 46 °C'
					}
				}
			}
		},
		tiles: {
			tilesNotFound: {
				title: `{count} tiles could not be loaded.`,
				description: `No data for the unit "{measure}" available on {date} at {hour}.`
			}
		}
	}
} satisfies Translation;

export default en;

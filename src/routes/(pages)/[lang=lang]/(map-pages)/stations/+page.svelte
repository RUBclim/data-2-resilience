<script lang="ts">
	import LL from '#i18n/i18n-svelte.js';
	import airTemperatureAndHumiditySensor from '#lib/assets/air-temperature-humidity-sensor.png';
	import weatherStation from '#lib/assets/weather-station.png';
	import CollapsibleParagraph from '#lib/components/CollapsibleParagraph.svelte';
	import SensorDescription from '#lib/components/SensorDescription.svelte';
	import StationsSelectionSection from '#lib/components/StationsSelectionSection.svelte';
</script>

<h1 class="mb-2 text-xl font-semibold">{$LL.pages.stations.title()}</h1>
<CollapsibleParagraph>
	{#each Object.values($LL.pages.stations.intro) as paragraph}
		<p>{paragraph()}</p>
	{/each}
</CollapsibleParagraph>

<ul id="sensor-descriptions" class="mt-6 flex scroll-mt-20 flex-col gap-6">
	<SensorDescription
		title={$LL.pages.stations.stationsDescriptions.weather.title()}
		description={$LL.pages.stations.stationsDescriptions.weather.description()}
		image={{ src: weatherStation, alt: 'Weather station with Blackglobe sensor' }}
		calculatedIndicators={Object.values(
			$LL.pages.stations.stationsDescriptions.weather.calculatedIndicators
		).map((i) => i())}
		measuredIndicators={Object.values(
			$LL.pages.stations.stationsDescriptions.weather.measuredIndicators
		).map((i) => i())}
		descriptionCalculated={$LL.pages.stations.stationsDescriptions.weather.calculatedDescription()}
	/>
	<SensorDescription
		title={$LL.pages.stations.stationsDescriptions.airTemperatureAndHumidity.title()}
		description={$LL.pages.stations.stationsDescriptions.airTemperatureAndHumidity.description()}
		image={{ src: airTemperatureAndHumiditySensor, alt: 'Air temperature and humidity sensor' }}
		calculatedIndicators={Object.values(
			$LL.pages.stations.stationsDescriptions.airTemperatureAndHumidity.calculatedIndicators
		).map((i) => i())}
		measuredIndicators={Object.values(
			$LL.pages.stations.stationsDescriptions.airTemperatureAndHumidity.measuredIndicators
		).map((i) => i())}
		descriptionCalculated={$LL.pages.stations.stationsDescriptions.airTemperatureAndHumidity.calculatedDescription()}
	/>
	<StationsSelectionSection />
</ul>

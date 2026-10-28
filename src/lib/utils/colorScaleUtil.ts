import type { TranslationFunctions } from '$i18n/i18n-types';
import { interpolateRgb, quantize } from 'd3-interpolate';
import { scaleLinear, scaleOrdinal, scaleSequential } from 'd3-scale';
import {
	interpolateBlues,
	interpolateRainbow,
	interpolateSpectral,
	interpolateTurbo,
	interpolateViridis,
	interpolateYlGnBu,
	interpolateYlOrBr
} from 'd3-scale-chromatic';
import {
	getHealthRiskKeyByValue,
	getHealthRisksByUnit,
	healthRisksRanges,
	isHealthRiskUnit,
	type HealthRiskUnit
} from './healthRisksUtil';

const schemeTurboSequential: readonly string[] = quantize(interpolateTurbo, 10);
const schemeTurboOrdinal: readonly string[] = quantize(interpolateTurbo, 10);
const schemeSpectralReversed: readonly string[] = quantize(interpolateSpectral, 10).toReversed();
const schemeYlGnBu: readonly string[] = quantize(interpolateYlGnBu, 10);
const schemeViridis: readonly string[] = quantize(interpolateViridis, 10);
const schemeBlues: readonly string[] = quantize(interpolateBlues, 10);
const schemeYlOrBr: readonly string[] = quantize(interpolateYlOrBr, 10);
export const schemeBrBG: readonly string[] = quantize(interpolateRainbow, 10).toReversed();

type SequentialScapeType = {
	type: 'sequential';
	scheme: readonly string[];
	perc5: number;
	perc95: number;
	validMin: number;
	validMax: number;
	fraction: number;
};

type OrdinalScaleType = {
	type: 'ordinal';
	scheme: readonly string[];
};

export const unitsToScalesMap = {
	default: {
		type: 'sequential',
		scheme: schemeBrBG,
		perc5: 0,
		perc95: 100,
		validMin: 0,
		validMax: 100,
		fraction: 1
	},
	air_temperature: {
		type: 'sequential',
		scheme: schemeSpectralReversed,
		perc5: 0,
		perc95: 24,
		validMin: -Infinity,
		validMax: Infinity,
		fraction: 0.25
	},
	absolute_humidity: {
		type: 'sequential',
		scheme: schemeYlGnBu,
		perc5: 3,
		perc95: 14,
		validMin: 0,
		validMax: Infinity,
		fraction: 0.3
	},
	atmospheric_pressure: {
		type: 'sequential',
		scheme: schemeYlGnBu,
		perc5: 983,
		perc95: 1016,
		validMin: 860,
		validMax: 1055,
		fraction: 0.3
	},
	atmospheric_pressure_reduced: {
		type: 'sequential',
		scheme: schemeYlGnBu,
		perc5: 998,
		perc95: 1031,
		validMin: 860,
		validMax: 1055,
		fraction: 0.3
	},
	dew_point: {
		type: 'sequential',
		scheme: schemeYlGnBu,
		perc5: -3,
		perc95: 17,
		validMin: -Infinity,
		validMax: Infinity,
		fraction: 0.3
	},
	heat_index: {
		type: 'sequential',
		scheme: schemeTurboSequential,
		perc5: -3,
		perc95: 25,
		validMin: -Infinity,
		validMax: Infinity,
		fraction: 0.3
	},
	lightning_average_distance: {
		type: 'sequential',
		scheme: schemeViridis,
		perc5: 0,
		perc95: 15,
		validMin: 0,
		validMax: Infinity,
		fraction: 0.3
	},
	lightning_strike_count: {
		type: 'sequential',
		scheme: schemeViridis,
		perc5: 0,
		perc95: 30,
		validMin: 0,
		validMax: Infinity,
		fraction: 0.3
	},
	maximum_wind_speed: {
		type: 'sequential',
		scheme: schemeViridis,
		perc5: 0,
		perc95: 8,
		validMin: 0,
		validMax: Infinity,
		fraction: 0.3
	},
	mrt: {
		type: 'sequential',
		scheme: schemeSpectralReversed,
		perc5: -4,
		perc95: 44,
		validMin: -Infinity,
		validMax: Infinity,
		fraction: 0.3
	},
	pet: {
		type: 'sequential',
		scheme: schemeTurboSequential,
		perc5: -5,
		perc95: 25,
		validMin: -Infinity,
		validMax: Infinity,
		fraction: 0.7
	},
	pet_category: {
		type: 'ordinal',
		scheme: schemeTurboOrdinal
	},
	precipitation_sum: {
		type: 'sequential',
		scheme: schemeBlues,
		perc5: 0,
		perc95: 5,
		validMin: 0,
		validMax: Infinity,
		fraction: 0.1
	},
	relative_humidity: {
		type: 'sequential',
		scheme: schemeYlGnBu,
		perc5: 3,
		perc95: 14,
		validMin: 0,
		validMax: Infinity,
		fraction: 0.3
	},
	solar_radiation: {
		type: 'sequential',
		scheme: schemeYlOrBr,
		perc5: 0,
		perc95: 603,
		validMin: 0,
		validMax: 1400,
		fraction: 0.3
	},
	utci: {
		type: 'sequential',
		scheme: schemeTurboSequential,
		perc5: -3,
		perc95: 24,
		validMin: -Infinity,
		validMax: Infinity,
		fraction: 0.7
	},
	utci_category: {
		type: 'ordinal',
		scheme: schemeTurboOrdinal
	},
	vapor_pressure: {
		type: 'sequential',
		scheme: schemeViridis,
		perc5: 4,
		perc95: 16,
		validMin: 0,
		validMax: Infinity,
		fraction: 0.3
	},
	wet_bulb_temperature: {
		type: 'sequential',
		scheme: schemeSpectralReversed,
		perc5: -2,
		perc95: 16,
		validMin: -Infinity,
		validMax: Infinity,
		fraction: 0.3
	},
	wind_direction: {
		type: 'sequential',
		scheme: schemeBrBG,
		perc5: 0,
		perc95: 4,
		validMin: 0,
		validMax: Infinity,
		fraction: 0.3
	},
	wind_speed: {
		type: 'sequential',
		scheme: schemeViridis,
		perc5: 0,
		perc95: 4,
		validMin: 0,
		validMax: Infinity,
		fraction: 0.3
	}
} satisfies Record<string, SequentialScapeType | OrdinalScaleType>;

export function computeColormapRanges(
	values: Array<unknown>,
	paramObj: SequentialScapeType
): [number, number] {
	const filteredValues = values.filter((val) => typeof val === 'number') as number[];
	const dataMin = Math.min(...filteredValues);
	const dataMax = Math.max(...filteredValues);
	const dataRange = dataMax - dataMin;
	const expectedRange = paramObj.perc95 - paramObj.perc5;
	const minimumRange = Math.abs(expectedRange * paramObj.fraction);

	let vMin = dataMin;
	let vMax = dataMax;

	if (dataRange < minimumRange) {
		if (dataRange === 0) {
			vMin = dataMin - minimumRange / 2;
			vMax = dataMax + minimumRange / 2;
		} else {
			const valDiff = minimumRange - dataRange;
			vMin = dataMin - valDiff / 2;
			vMax = dataMax + valDiff / 2;
		}
	}

	if (vMin < paramObj.perc5 && isFinite(paramObj.perc5)) {
		vMin = paramObj.perc5;
	}
	if (vMax > paramObj.perc95 && isFinite(paramObj.perc95)) {
		vMax = paramObj.perc95;
	}

	return [vMin, vMax];
}

type ColorStop = { color: string; position: number };
type ColorStops = ColorStop[];

const isOrdinalUnit = (unit: string) => unit.trim().toLowerCase().endsWith('_category');

function getUnitColorScheme(unit: string) {
	return (unitsToScalesMap[unit as keyof typeof unitsToScalesMap] || unitsToScalesMap.default)
		.scheme;
}

const getUniformGrayScale = () => {
	return scaleLinear<string>().domain([0, 1]).range(['hsl(var(--muted))', 'hsl(var(--muted))']);
};

const getHealthRiskUnitColorStops = (params: {
	unit: HealthRiskUnit;
	LL: TranslationFunctions;
	min: number | null;
	max: number | null;
}): ColorStops => {
	const { unit, LL, min, max } = params;
	if (!isHealthRiskUnit(unit)) return [];
	if (min === undefined || max === undefined || min === null || max === null) {
		return [
			{ color: 'hsl(var(--muted))', position: 0 },
			{ color: 'hsl(var(--muted))', position: 100 }
		];
	}

	const unitWithoutCategory = unit
		.trim()
		.toLowerCase()
		.replace(/_category$/, '') as HealthRiskUnit;
	const ranges = Object.entries(healthRisksRanges)
		.map(([key, ranges]) => ({
			key,
			idx: ranges.idx,
			min: ranges[unitWithoutCategory || 'utci']?.min ?? 0,
			max: ranges[unitWithoutCategory || 'utci']?.max ?? 100
		}))
		.sort((a, b) => a.idx - b.idx);
	const minHealthRiskRange = ranges.reduce(
		(acc, range) => {
			const { min: rMin, max: rMax } = range;
			if (min >= rMin && min < rMax) return range;
			return acc;
		},
		ranges.find((r) => r.idx === 0) || ranges[0]
	);
	const maxHealthRiskRange = ranges.reduce(
		(acc, range) => {
			const { min: rMin, max: rMax } = range;
			if (max >= rMin && max < rMax) return range;
			return acc;
		},
		ranges.find((r) => r.idx === ranges.length - 1) || ranges[ranges.length - 1]
	);
	let validRanges = ranges.filter(
		(r) => r.idx >= minHealthRiskRange.idx && r.idx < maxHealthRiskRange.idx
	);
	if (validRanges.length === 1) {
		validRanges = [validRanges[0], validRanges[0]];
	}
	const stops = validRanges.map((range, idx) => {
		const value = idx === validRanges.length - 1 ? range.max : range.min;
		const color = getHealthRiskColorByValue({ value, unit, LL });
		return {
			color,
			position: (idx / (validRanges.length - 1)) * 100
		};
	});
	return stops;
};

export const getColorStops = (params: {
	unit: string;
	LL: TranslationFunctions;
	min: number | null;
	max: number | null;
}): ColorStops => {
	const { min, max } = params;
	const colors = getColorsByUnit(params);
	if (min === undefined || max === undefined || min === null || max === null) {
		return [
			{ color: 'hsl(var(--muted))', position: 0 },
			{ color: 'hsl(var(--muted))', position: 100 }
		];
	}
	if (isHealthRiskUnit(params.unit)) {
		return getHealthRiskUnitColorStops({
			...params,
			unit: params.unit as HealthRiskUnit
		});
	}
	const stops = colors.map((color, i) => ({ color, position: (i / (colors.length - 1)) * 100 }));
	return stops;
};

function getColorScaleFn(params: {
	unit: string;
	LL: TranslationFunctions;
	min: number | null;
	max: number | null;
}) {
	const { unit, min, max } = params;
	const scheme = getUnitColorScheme(unit);

	if (min === undefined || max === undefined || min === null || max === null) {
		return getUniformGrayScale();
	}

	if (isOrdinalUnit(unit)) return scaleOrdinal(scheme);

	function customInterpolator(t: number) {
		const stops = getColorStops(params);
		const scale = scaleLinear<string>()
			.domain(stops.map((s) => s.position / 100))
			.range(stops.map((s) => s.color))
			.interpolate(interpolateRgb);
		return scale(t);
	}
	return scaleSequential(customInterpolator).domain([min, max]);
}

function getHealthRiskColorByValue(params: {
	value: number | string;
	unit: 'utci' | 'pet';
	LL: TranslationFunctions;
}) {
	const { value, unit, LL } = params;
	const categories = getHealthRisksByUnit({ unit, LL }).map(({ key }) => key);
	const val =
		typeof value === 'string'
			? value
			: getHealthRiskKeyByValue({ value, unit: unit as 'utci' | 'pet' });
	const normalizedVal = val === 'slight heat stress' ? 'moderate heat stress' : (val as string);
	const categoryIndex = categories.indexOf(normalizedVal);
	if (categoryIndex === -1) return 'hsl(var(--muted-foreground))';
	const colors = getColorsByUnit({ unit, LL });
	const color = colors[categoryIndex];
	return color;
}

export function getColorScaleValue(params: {
	unit: string;
	LL: TranslationFunctions;
	value: number | string;
	min: number | null;
	max: number | null;
}) {
	const { unit, value } = params;

	const isWindDirectionUnit = unit.startsWith('wind_direction');
	if (isWindDirectionUnit) return 'hsl(var(--muted-foreground))';

	const scale = getColorScaleFn(params);

	if (isHealthRiskUnit(unit))
		return getHealthRiskColorByValue({
			...params,
			unit: unit as 'utci' | 'pet'
		});

	return scale(value as { valueOf(): number } & string);
}

export function getColorsByUnit({ unit, LL }: { unit: string; LL: TranslationFunctions }) {
	const scheme = getUnitColorScheme(unit);
	if (!isHealthRiskUnit(unit)) return scheme;
	const healthRisksCount = getHealthRisksByUnit({ unit, LL }).length;
	const colors = (scheme as string[]).slice(-healthRisksCount);
	return colors;
}

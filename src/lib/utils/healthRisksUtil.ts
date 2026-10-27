import type { TranslationFunctions } from '#i18n/i18n-types.js';
import { cn } from '#lib/utils.js';
import { getColorScaleValue } from './colorScaleUtil';
import { getHeatStressCategoryByValue } from './heatStressCategoriesUtil';
export const healthRisksRanges = {
	'extreme cold stress': {
		idx: 0,
		pet: {
			min: -Infinity,
			max: -Infinity
		},
		utci: {
			min: -Infinity,
			max: -40
		}
	},
	'very strong cold stress': {
		idx: 1,
		pet: {
			min: -Infinity,
			max: 4
		},
		utci: {
			min: -40,
			max: -27
		}
	},
	'strong cold stress': {
		idx: 2,
		pet: {
			min: 4,
			max: 8
		},
		utci: {
			min: -27,
			max: -13
		}
	},
	'moderate cold stress': {
		idx: 3,
		pet: {
			min: 8,
			max: 13
		},
		utci: {
			min: -13,
			max: 0
		}
	},
	'slight cold stress': {
		idx: 4,
		pet: {
			min: 13,
			max: 18
		},
		utci: {
			min: 0,
			max: 9
		}
	},
	'no thermal stress': {
		idx: 5,
		pet: {
			min: 18,
			max: 23
		},
		utci: {
			min: 9,
			max: 26
		}
	},
	'moderate heat stress': {
		idx: 6,
		pet: {
			min: 23,
			max: 29
		},
		utci: {
			min: 26,
			max: 32
		}
	},
	'strong heat stress': {
		idx: 7,
		pet: {
			min: 29,
			max: 35
		},
		utci: {
			min: 32,
			max: 38
		}
	},
	'very strong heat stress': {
		idx: 8,
		pet: {
			min: 35,
			max: 41
		},
		utci: {
			min: 38,
			max: 46
		}
	},
	'extreme heat stress': {
		idx: 9,
		pet: {
			min: 41,
			max: Infinity
		},
		utci: {
			min: 46,
			max: Infinity
		}
	}
};

const healthRiskUnits = ['utci', 'pet'] as const;
export type HealthRiskUnit = (typeof healthRiskUnits)[number];

function getUnitWithoutCategory(unit: string) {
	return unit
		.trim()
		.toLowerCase()
		.replace(/_category$/, '');
}
export const isHealthRiskUnit = (unit: string) => {
	return healthRiskUnits.includes(getUnitWithoutCategory(unit) as HealthRiskUnit);
};

const isOrdinalUnit = (unit: string) => unit.trim().toLowerCase().endsWith('_category');

export function getHealthRiskTitleKey(unit: string) {
	return isOrdinalUnit(unit) ? ('heatStress' as const) : ('thermalComfort' as const);
}

export function normalizeHealthRiskKey(key: string) {
	return key === 'slight heat stress' ? 'moderate heat stress' : key;
}

export function getHealthRiskByKey(params: {
	key: string;
	unit: string;
	LL: TranslationFunctions;
}) {
	const key = normalizeHealthRiskKey(params.key);
	const healthRisks = getHealthRisksByUnit({ unit: params.unit, LL: params.LL });
	return healthRisks.find((healthRisk) => healthRisk.key === key);
}

export function getHealthRisksByUnit({
	LL,
	unit
}: {
	unit: string;
	LL: TranslationFunctions;
	showColdRisks?: boolean;
}) {
	if (!isHealthRiskUnit(unit)) return [];
	const titleKey = getHealthRiskTitleKey(unit);
	const allObjs = Object.entries(LL.map.choroplethLegend.healthRisks).filter(
		([_key, item]) => !!item.title[titleKey]()
	);
	return allObjs.map(([key, { title, description, ranges }]) => ({
		key: normalizeHealthRiskKey(key),
		title: title[titleKey](),
		description: description(),
		ranges: ranges[getUnitWithoutCategory(unit) as HealthRiskUnit]()
	}));
}

export function getHealthRiskKeyByValue({
	unit,
	value
}: {
	unit: 'utci' | 'pet';
	value: number | string | undefined | null;
}) {
	if (!isHealthRiskUnit(unit)) return null;
	if (typeof value === 'string') return normalizeHealthRiskKey(value);
	if (typeof value !== 'number') return null;
	const cleanUnit = unit.trim().toLowerCase();
	if (cleanUnit === 'utci_category' || cleanUnit === 'pet_category') {
		return getHeatStressCategoryByValue(value);
	}
	const unitWithoutCategory = cleanUnit.replace(/_category$/, '') as HealthRiskUnit;
	return Object.entries(healthRisksRanges).reduce(
		(acc, [key, range]) => {
			const { min, max } = range[unitWithoutCategory || 'utci'];
			if (value >= min && value < max) {
				return normalizeHealthRiskKey(key);
			}
			return acc;
		},
		null as string | null
	);
}

export function getHealthRiskPill({
	value,
	unit,
	LL,
	min,
	max,
	withLabel = false
}: {
	value: number | string | undefined | null;
	unit: string;
	LL: TranslationFunctions;
	min: number | null;
	max: number | null;
	withLabel?: boolean;
}) {
	const unitWithoutCategory = unit.replace(/_category$/, '');

	let healthRiskLabel: string = '';
	let color: string | null = null;

	if (typeof value === 'string') {
		healthRiskLabel =
			getHealthRiskByKey({ key: value, unit: unitWithoutCategory, LL })?.title || '';
		color = getColorScaleValue({ unit, LL, value, min, max });
	} else if (typeof value === 'number') {
		const key = getHealthRiskKeyByValue({ value, unit: unitWithoutCategory as 'utci' | 'pet' });
		if (key) {
			healthRiskLabel = getHealthRiskByKey({ key, unit: unitWithoutCategory, LL })?.title || '';
		}
		color = getColorScaleValue({ unit, LL, value, min, max });
	}

	const isUnavailable = value === null;
	const isUnsupported = typeof value === 'undefined';
	const isWindDirectionUnit = unitWithoutCategory.startsWith('wind_direction');

	if (isUnavailable) {
		healthRiskLabel = LL.map.choroplethLegend.noValueAvailable();
	} else if (isUnsupported) {
		healthRiskLabel = LL.map.choroplethLegend.notCollectingData();
	} else if (isWindDirectionUnit) {
		healthRiskLabel = LL.map.choroplethLegend.withData();
	}

	return `
		<span
			class="${cn(
				'relative size-3 rounded-full',
				isUnsupported && 'bg-muted-foreground/30',
				isUnavailable && 'bg-muted-foreground/5'
			)}"
			style="${cn(color && `background-color: ${color};`)}"
		>
			<span
				class="${cn(
					'absolute inset-0 rounded-full border',
					!isUnavailable && !isUnsupported && `border-black/20 mix-blend-multiply`,
					isUnsupported && 'border-muted-foreground',
					isUnavailable && 'border-[3px] border-muted-foreground/50'
				)}"
			></span>
		</span>
		${cn(
			withLabel &&
				`
				<span class="${cn((isUnavailable || isUnsupported) && 'text-muted-foreground')}">
					${healthRiskLabel}
				</span>
			`
		)}
	`;
}

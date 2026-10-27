import type { TranslationFunctions } from '#i18n/i18n-types.js';
import { getHealthRisksByUnit } from './healthRisksUtil';

export function getHeatStressLabel(params: {
	unit: string;
	LL: TranslationFunctions;
	value: string;
}) {
	const { unit, LL, value } = params;
	const allRanges = getHealthRisksByUnit({ unit, LL });
	const matchingRange = allRanges.find(({ key }) => key === value);
	return matchingRange?.title || '';
}

type SortUnit = { value: string; label: string };
export function sortUnitByLabel(a: SortUnit, b: SortUnit, locale: string) {
	if (a.value.startsWith('utci') && !b.value.startsWith('utci')) return -1;
	if (!a.value.startsWith('utci') && b.value.startsWith('utci')) return 1;
	if (a.value.startsWith('utci') && b.value.startsWith('utci'))
		return a.label.length - b.label.length;
	return a.label.localeCompare(b.label, locale);
}

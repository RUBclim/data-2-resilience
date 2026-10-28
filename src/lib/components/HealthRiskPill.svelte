<script lang="ts">
	import { LL } from '#i18n/i18n-svelte.js';
	import type { StationsGeoJSONType } from '#lib/stores/mapData.js';
	import { unit } from '#lib/stores/uiStore.js';
	import { getHealthRiskPill } from '#lib/utils/healthRisksUtil.js';
	import { useStationsSnapshotConfig } from '#lib/utils/useStationsSnapshot.js';
	import { createQuery } from '@tanstack/svelte-query';

	type Props = {
		value: number | string | undefined | null;
		withLabel?: boolean;
		initialStationIds?: string[];
		stations: StationsGeoJSONType;
	};

	const { value, withLabel = false, initialStationIds = [], stations }: Props = $props();

	const stationsSnapshotQueryConfig = $derived.by(() =>
		useStationsSnapshotConfig({ initialStationIds, stations })
	);
	const snapshotQuery = createQuery(() => $stationsSnapshotQueryConfig);

	const pill = $derived(
		getHealthRiskPill({
			value,
			unit: $unit,
			LL: $LL,
			withLabel,
			min: snapshotQuery.data?.scaleMin ?? null,
			max: snapshotQuery.data?.scaleMax ?? null
		})
	);
</script>

{@html pill}

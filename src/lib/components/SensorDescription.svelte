<script lang="ts">
	import { LL, locale } from '#i18n/i18n-svelte.js';
	import { sortUnitByLabel } from '#lib/utils/textUtil.js';
	import CollapsibleParagraph from './CollapsibleParagraph.svelte';

	interface Props {
		title: string;
		description: string;
		image: {
			src: string;
			alt: string;
		};
		calculatedIndicators: string[];
		measuredIndicators: string[];
		descriptionCalculated: string;
	}

	const {
		title,
		description,
		image,
		calculatedIndicators,
		measuredIndicators,
		descriptionCalculated
	}: Props = $props();

	const indicators = $derived(
		calculatedIndicators
			.reduce(
				(acc, i) => {
					const units = $LL.pages.measurements.unitSelect.units;
					const value = i as keyof typeof units;
					const label = units[value]?.label();
					const unitOnly = units[value]?.unitOnly();
					if (label) return [...acc, { value, label, unitOnly }];
					return acc;
				},
				[] as { value: string; label: string; unitOnly: string }[]
			)
			.sort((a, b) => sortUnitByLabel(a, b, $locale))
	);
	const measuredIndicatorsList = $derived(
		measuredIndicators
			.reduce(
				(acc, i) => {
					const units = $LL.pages.measurements.unitSelect.units;
					const value = i as keyof typeof units;
					const label = units[value]?.label();
					const unitOnly = units[value]?.unitOnly();
					if (label) return [...acc, { value, label, unitOnly }];
					return acc;
				},
				[] as { value: string; label: string; unitOnly: string }[]
			)
			.sort((a, b) => sortUnitByLabel(a, b, $locale))
	);
</script>

<li class="rounded-xl border border-border bg-background">
	<header class="flex h-fit flex-col items-start border-b border-border p-4 pb-6">
		<h2 class="mb-1 text-lg font-semibold">
			{title}
		</h2>
		<CollapsibleParagraph linesClampedCount={3} className="text-sm">
			<p>{description}</p>
			<strong class="mt-4 mb-1 block text-base font-semibold">
				{$LL.pages.stations.stationsDescriptions.measuredIndicatorsLabel()}:
			</strong>
			<ul class="flex flex-col gap-1 pb-4">
				{#each measuredIndicatorsList as { value, label, unitOnly } (value)}
					<li class="border-b border-muted pb-1">
						{label}
						{#if unitOnly}
							<span class="text-muted-foreground"> ({unitOnly})</span>
						{/if}
					</li>
				{/each}
			</ul>
			<p>{descriptionCalculated}</p>
			<strong class="mt-4 mb-1 block text-base font-semibold">
				{$LL.pages.stations.stationsDescriptions.calculatedIndicatorsLabel()}:
			</strong>
			<ul class="flex flex-col gap-1 pb-4">
				{#each indicators as { value, label, unitOnly } (value)}
					<li class="border-b border-muted pb-1">
						{label}
						{#if unitOnly}
							<span class="text-muted-foreground"> ({unitOnly})</span>
						{/if}
					</li>
				{/each}
			</ul>
		</CollapsibleParagraph>
	</header>
	<img
		src={image.src}
		alt={image.alt}
		class="aspect-[2.61/1] w-full rounded-b-xl bg-primary object-contain"
	/>
</li>

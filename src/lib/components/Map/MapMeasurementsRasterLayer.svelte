<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { PUBLIC_API_BASE_URL, PUBLIC_ENABLE_HEATATLAS_TIMESLIDER } from '$env/static/public';
	import { LL, locale } from '$i18n/i18n-svelte';
	import { dayValue, heatStressUnit, heatStressUnitLabel, hour } from '$lib/stores/uiStore';
	import { cn } from '$lib/utils';
	import { api } from '$lib/utils/api';
	import { today } from '$lib/utils/dateUtil';
	import { reactiveQueryArgs } from '$lib/utils/queryUtils.svelte';
	import { createQuery, type QueryKey, type QueryOptions } from '@tanstack/svelte-query';
	import { Description, Title } from 'components/ui/alert';
	import Alert from 'components/ui/alert/alert.svelte';
	import Button from 'components/ui/button/button.svelte';
	import {
		addDays,
		addHours,
		getDayOfYear,
		getHours,
		getYear,
		isSameHour,
		setHours,
		startOfHour
	} from 'date-fns';
	import { TriangleAlert } from 'lucide-svelte';
	import type { Map as MaplibreMap } from 'maplibre-gl';
	import { onDestroy, onMount } from 'svelte';
	import { RasterLayer, RasterTileSource } from 'svelte-maplibre';

	const LAYER_ID = 'heat-stress-raster-layer';

	interface Props {
		map: MaplibreMap;
		visible?: boolean;
	}

	const categoryToClassMap = {
		utci: 'UTCI',
		utci_category: 'UTCI_CLASS',
		relative_humidity: 'RH',
		air_temperature: 'TA'
	};
	class TileError extends Error {}
	type TileErrorInstance = InstanceType<typeof TileError>;
	type TilesErrorsMap = Map<string, Map<string, TileErrorInstance>>;

	let { map, visible = false }: Props = $props();
	let showTilesErrors = $state(true);
	let defaultTilesErrorMap = new Map(
		Object.values(categoryToClassMap).reduce((acc, key) => {
			acc.set(key, new Map());
			return acc;
		}, new Map() as TilesErrorsMap)
	);
	let tilesErrors = $state<TilesErrorsMap>(defaultTilesErrorMap);

	const showTimeslider = PUBLIC_ENABLE_HEATATLAS_TIMESLIDER === 'true';

	const p = $derived(page.url.pathname.replace(`/${$locale}`, '').replaceAll('/', ''));
	const isHeatStressPage = $derived(p === 'heat-stress');

	const hours = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23] // prettier-ignore

	const localSliderDate = $derived.by(() => {
		if (showTimeslider) return startOfHour(setHours(addDays(today(), $dayValue), $hour));
		return startOfHour(today());
	});
	const utcDate = $derived(addHours(localSliderDate, today().getTimezoneOffset() / 60));
	const doy = $derived(getDayOfYear(utcDate));
	const utcYear = $derived(getYear(utcDate));
	const utcHour = $derived(getHours(utcDate));
	const param = $derived(
		(
			categoryToClassMap[$heatStressUnit as keyof typeof categoryToClassMap] ||
			categoryToClassMap.utci
		).toUpperCase()
	);

	const queryKey = $derived(['lastAvailableRasterLayer', $heatStressUnit, utcYear]);
	const lastAvailableRasterLayerQuery = createQuery(
		reactiveQueryArgs(() => ({
			queryKey,
			queryFn: async ({ queryKey }: QueryOptions<QueryKey>) => {
				const [, param, year] = queryKey as [string, string, number];
				return api().getLatestRasterData({ year, param });
			},
			enabled: isHeatStressPage && !showTimeslider,
			staleTime: Infinity,
			cacheTime: Infinity
		}))
	);

	const finalConfig = $derived.by(() => {
		if (showTimeslider) {
			return {
				doy: doy,
				hour: utcHour,
				param: param.toUpperCase(),
				year: utcYear
			};
		}
		return {
			doy: $lastAvailableRasterLayerQuery.data?.doy ?? doy,
			hour: $lastAvailableRasterLayerQuery.data?.hour ?? utcHour,
			param: ($lastAvailableRasterLayerQuery.data?.param ?? param).toUpperCase(),
			year: $lastAvailableRasterLayerQuery.data?.year ?? utcYear
		};
	});

	const tilesUrls = $derived(
		hours.map((h) => {
			const { doy, param, year } = finalConfig;
			const paddedHour = `${h}`.padStart(2, '0');
			const paddedDayOfYear = `${doy}`.padStart(3, '0');
			let colormap = 'turbo';
			if (param.endsWith('_CLASS')) {
				colormap = 'explicit';
			} else if (param === 'RH') {
				colormap = 'ylgnbu';
			} else if (param === 'TA') {
				colormap = 'spectral_r';
			} else {
				colormap = 'turbo';
			}
			const queryParameters: Record<string, string> = {
				colormap: colormap,
				tile_size: '[256, 256]'
			};
			if (param.endsWith('_CLASS')) {
				queryParameters['explicit_color_map'] = JSON.stringify({
					'0': '23171b',
					'1': '4860e6',
					'2': '2aabee',
					'3': '2ee5ae',
					'4': '6afd6a',
					'5': 'c0ee3d',
					'6': 'feb927',
					'7': 'fe6e1a',
					'8': 'c2270a',
					'9': '900c00',
				});
			}
			const searchParams = new URLSearchParams(queryParameters);
			const url = `${PUBLIC_API_BASE_URL}/tms/singleband/${param}/${year}/${paddedDayOfYear}/${paddedHour}/{z}/{x}/{y}.png?${searchParams}`;
			return {
				layerHour: h,
				tilesUrl: url
			};
		})
	);

	const originalFetch = fetch;
	onMount(() => {
		window.fetch = async function (req: RequestInfo | URL, init?: RequestInit): Promise<Response> {
			const response = await originalFetch(req, init);

			if (response.status === 404 && req instanceof Request) {
				const url = new URL(req.url);
				const baseUrl = `${url.protocol}//${url.host}`;
				const isTileUrl = baseUrl === PUBLIC_API_BASE_URL;
				if (!isTileUrl) return response;
				const [, , , unit, year, dayOfYear, h, z, x, yWithExt] = url.pathname.split('/');
				const [y] = yWithExt.split('.');
				const config = { unit, year, dayOfYear, h, z, x, y };
				const configAsString = Object.entries(config)
					.map(([key, value]) => `${key}: ${value}`)
					.join(', ');
				const message = `Tile not found for ${configAsString}`;
				const key = [unit, year, dayOfYear, h, z, x, y].join('-');
				const newTilesErrorMap = new Map(tilesErrors) satisfies TilesErrorsMap;
				const unitTilesErrors = newTilesErrorMap.get(unit.toUpperCase());
				if (unitTilesErrors) {
					const newMap = new Map(unitTilesErrors);
					newMap.set(key, new TileError(message));
					newTilesErrorMap.set(unit.toUpperCase(), newMap);
				}
				tilesErrors = newTilesErrorMap;
			}

			return response;
		};
	});

	const tilesErrorsForThisTimeAndUnit = $derived.by(() => {
		const { doy, param, hour, year } = finalConfig;
		const unitTilesErrors = tilesErrors.get(param);
		if (!unitTilesErrors || unitTilesErrors.size === 0) return [];
		return unitTilesErrors.entries().reduce((acc, [key, tileError]: [string, TileError]) => {
			const paddedHour = `${hour}`.padStart(2, '0');
			const paddedDayOfYear = `${doy}`.padStart(3, '0');
			const keyStart = [param, year, paddedDayOfYear, paddedHour].join('-');
			if (key.startsWith(keyStart)) return [...acc, tileError];
			return acc;
		}, [] as TileError[]);
	});

	onDestroy(() => {
		window.fetch = originalFetch;
	});

	// svelte-ignore state_referenced_locally
	let lastSliderDate = utcDate;
	$effect(() => {
		if (!map || !showTimeslider || !lastSliderDate || !utcDate || !browser) return;
		if (isSameHour(utcDate, lastSliderDate)) return;
		map.style.sourceCaches[`${LAYER_ID}-${finalConfig.hour}`].clearTiles();
		map.triggerRepaint();
		lastSliderDate = utcDate;
	});

	const numberFormatter = $derived(
		new Intl.NumberFormat($locale, {
			minimumIntegerDigits: 2,
			useGrouping: false
		})
	);
	const dateFormatter = $derived(
		new Intl.DateTimeFormat($locale, {
			dateStyle: 'long'
		})
	);
	const timeFormatter = $derived(
		new Intl.DateTimeFormat($locale, {
			hour: '2-digit',
			minute: '2-digit'
		})
	);
</script>

{#each tilesUrls as { layerHour, tilesUrl } (layerHour)}
	<RasterTileSource tiles={[tilesUrl]} tileSize={256} id={`${LAYER_ID}-${layerHour}`}>
		<RasterLayer
			paint={{}}
			layout={{ visibility: visible && finalConfig.hour === layerHour ? 'visible' : 'none' }}
			beforeLayerType="line"
		/>
	</RasterTileSource>
{/each}

{#if tilesErrorsForThisTimeAndUnit.length > 0}
	<div
		class={cn(
			'absolute left-1/2 top-4 z-50 w-fit -translate-x-1/2 bg-background/50 backdrop-blur-sm'
		)}
	>
		{#if !showTilesErrors}
			<Button
				onclick={() => (showTilesErrors = true)}
				size="icon"
				variant="outline"
				class={cn(
					'border-destructive bg-destructive/10 text-destructive',
					'hover-hover:hover:bg-destructive hover-hover:hover:text-white'
				)}
			>
				<TriangleAlert class="size-6" />
			</Button>
		{:else}
			<Alert variant="destructive" class="relative w-fit max-w-96 rounded-md text-sm">
				<Title class="relative">
					{$LL.map.tiles.tilesNotFound.title({
						count: numberFormatter.format(tilesErrorsForThisTimeAndUnit.length)
					})}
				</Title>
				<Description>
					{$LL.map.tiles.tilesNotFound.description({
						date: dateFormatter.format(localSliderDate),
						hour: timeFormatter.format(localSliderDate),
						measure: $heatStressUnitLabel
					})}
				</Description>
				<div class="mt-2 flex">
					<Button
						onclick={() => {
							showTilesErrors = false;
						}}
						size="sm"
						variant="outline"
						class={cn(
							'border-destructive bg-destructive/10 text-foreground',
							'hover-hover:hover:bg-destructive hover-hover:hover:text-white'
						)}
					>
						{$LL.generic.dismiss()}
					</Button>
				</div>
			</Alert>
		{/if}
	</div>
{/if}

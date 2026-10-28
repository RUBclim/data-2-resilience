<script lang="ts">
	import LL, { locale } from '$i18n/i18n-svelte';
	import {
		closeLeftSidebar,
		datavisType,
		dayValue,
		heatStressUnit,
		hour,
		minMaxAvg,
		openLeftSidebar,
		rangeEnd,
		rangeStart,
		udpateDatavisType,
		udpateDay,
		udpateRangeStart,
		unit,
		updateHeatStressUnit,
		updateHour,
		updateMinMaxAvg,
		updateRangeEnd,
		updateUnit
	} from '$lib/stores/uiStore';
	import { SidebarState } from '$lib/types/sidebar';
	import { cn } from '$lib/utils';
	import { today } from '$lib/utils/dateUtil';
	import { getHours } from 'date-fns';
	import { ArrowDown, X } from 'lucide-svelte';
	import Shepherd, { type StepOptions, type StepOptionsButton, type Tour } from 'shepherd.js';
	import 'shepherd.js/dist/css/shepherd.css';
	import { onMount } from 'svelte';
	import { queryParameters } from 'sveltekit-search-params';
	import Button from './ui/button/button.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	let opened = $state(false);
	let tour: Tour | undefined;
	const isMobile = () => window.matchMedia('(max-width: 1280px)').matches;

	onMount(() => {
		const lastValue = localStorage.getItem('welcome-opened');
		if (lastValue === 'true' || lastValue === null) {
			opened = true;
		} else if (lastValue === 'false') {
			opened = false;
		}
	});

	function getTour() {
		if (typeof tour?.id !== 'undefined') return tour;
		tour = new Shepherd.Tour({
			useModalOverlay: true,
			keyboardNavigation: true,
			exitOnEsc: true,
			defaultStepOptions: {
				classes: 'shepherd-theme-custom',
				scrollTo: false
			}
		});
		return tour;
	}

	onMount(() => {
		const t = getTour();

		t.on('start', onTourStart);
		t.on('active', onTourActive);
		t.on('cancel', onTourEnd);

		return () => {
			const t = getTour();
			t.off('start', onTourStart);
			t.off('active', onTourActive);
			t.off('cancel', onTourEnd);
		};
	});

	async function wait(timeout: number): Promise<void> {
		return new Promise((resolve) => {
			const to = setTimeout(() => {
				clearTimeout(to);
				resolve();
			}, timeout);
		});
	}

	async function waitForElement(selector: string): Promise<HTMLElement | false> {
		let it: NodeJS.Timeout | undefined;

		try {
			return await Promise.race([
				new Promise<HTMLElement | false>((resolve) => {
					it = setInterval(() => {
						const element = document.querySelector(selector);
						if (!(element instanceof HTMLElement)) return;
						resolve(element);
						clearInterval(it);
					}, 100);
				}),
				new Promise<false>((resolve) => wait(2000).then(() => resolve(false)))
			]);
		} finally {
			clearInterval(it);
		}
	}

	async function scrollToHandler(selector: string) {
		const element = document.querySelector(selector) as HTMLElement;
		const container = await waitForElement('#left-sidebar-scroll-container');
		if (!container || !element) return;

		const targetOffsetTop = element.offsetTop;
		const scrollMarginTop = Number.parseInt(getComputedStyle(element).scrollMarginTop, 10) || 0;

		const targetScrollPosition = targetOffsetTop - scrollMarginTop;

		container.scrollTo({
			top: targetScrollPosition,
			behavior: 'smooth'
		});
	}

	async function ensurePage(path: string, currentPathname: string) {
		const pathWithLocale = `/${$locale}${path === '/' ? '' : path}`;
		const fullPath = `${pathWithLocale}?${urlQuery}`;
		if (currentPathname !== pathWithLocale) {
			await goto(fullPath, { replaceState: true, keepFocus: true, noScroll: true });
		}
	}

	const queryParams = $derived(queryParameters());
	const urlQuery = $derived(new URLSearchParams($queryParams).toString());

	const buttons = $derived.by(() => ({
		nextButton: {
			text: $LL.welcome.tourSteps.buttons.next(),
			action: () => tour?.next()
		} satisfies StepOptionsButton,
		prevButton: {
			text: $LL.welcome.tourSteps.buttons.prev(),
			action: () => tour?.back(),
			secondary: true
		} satisfies StepOptionsButton,
		cancelButton: {
			text: $LL.welcome.tourSteps.buttons.cancel(),
			action: () => tour?.cancel(),
			secondary: true
		} satisfies StepOptionsButton,
		restartButton: {
			text: $LL.welcome.tourSteps.buttons.restart(),
			action: () => tour?.show(0),
			secondary: true
		} satisfies StepOptionsButton,
		finishButton: {
			text: $LL.welcome.tourSteps.buttons.last(),
			action: () => {
				tour?.complete();
				onTourEnd();
			}
		} satisfies StepOptionsButton
	}));

	function initTour(t: Tour) {
		if (t.isActive()) return;

		const steps = [
			{
				id: 'welcome',
				title: $LL.welcome.tourSteps.welcome.title(),
				text: $LL.welcome.tourSteps.welcome.text(),
				async beforeShowPromise() {
					await ensurePage('/', window.location.pathname);
				}
			} satisfies StepOptions,
			{
				id: 'navigation',
				title: $LL.welcome.tourSteps.navigation.title(),
				text: $LL.welcome.tourSteps.navigation.text(),
				attachTo: {
					element: '#navigation',
					on: isMobile() ? 'auto' : 'right'
				},
				beforeShowPromise: async () => {
					await ensurePage('/', window.location.pathname);
					openLeftSidebar();
					await scrollToHandler('#navigation');
				}
			} satisfies StepOptions,
			{
				id: 'measurements',
				title: $LL.welcome.tourSteps.measurements.title(),
				text: $LL.welcome.tourSteps.measurements.text(),
				attachTo: {
					element: '#value-selectors',
					on: isMobile() ? 'auto' : 'right'
				},
				beforeShowPromise: async () => {
					await ensurePage('/', window.location.pathname);
					openLeftSidebar();
					await scrollToHandler('#value-selectors');
				}
			} satisfies StepOptions,
			{
				id: 'visualisation',
				title: $LL.welcome.tourSteps.visualisation.title(),
				text: $LL.welcome.tourSteps.visualisation.text(),
				attachTo: {
					element: '#stations-datavis',
					on: isMobile() ? 'auto' : 'right'
				},
				extraHighlights: ['#stations-histogram'],
				beforeShowPromise: async () => {
					await ensurePage('/', window.location.pathname);
					openLeftSidebar();
					await scrollToHandler('#stations-datavis');
				}
			} satisfies StepOptions,
			{
				id: 'datavisType',
				title: $LL.welcome.tourSteps.datavisType.title(),
				text: $LL.welcome.tourSteps.datavisType.text(),
				attachTo: {
					element: '#stations-datavis',
					on: isMobile() ? 'auto' : 'right'
				},
				extraHighlights: ['#date-range-slider'],
				beforeShowPromise: async () => {
					await ensurePage('/', window.location.pathname);
					openLeftSidebar();
					await scrollToHandler('#stations-datavis');
				}
			} satisfies StepOptions,
			{
				id: 'map',
				title: $LL.welcome.tourSteps.map.title(),
				text: $LL.welcome.tourSteps.map.text(),
				attachTo: {
					element: '#map',
					on: 'left'
				},
				extraHighlights: ['#map-search'],
				beforeShowPromise: async () => {
					await ensurePage('/', window.location.pathname);
					if (isMobile()) {
						closeLeftSidebar();
					} else {
						openLeftSidebar();
					}
				}
			},
			{
				id: 'heatStress',
				title: $LL.welcome.tourSteps.heatStress.title(),
				text: $LL.welcome.tourSteps.heatStress.text(),
				attachTo: {
					element: '#heat-stress-selector',
					on: 'right'
				},
				extraHighlights: [`#navigation-tab-heat-stress`],
				beforeShowPromise: async () => {
					await ensurePage('/heat-stress', window.location.pathname);
					if (isMobile()) {
						closeLeftSidebar();
					} else {
						openLeftSidebar();
					}
				}
			},
			{
				id: 'stationsTable',
				title: $LL.welcome.tourSteps.stationsTable.title(),
				text: $LL.welcome.tourSteps.stationsTable.text(),
				attachTo: {
					element: '#stations-table'
				},
				extraHighlights: [
					'#sensor-descriptions',
					'#station-table-search',
					'#navigation-tab-stations'
				],
				beforeShowPromise: async () => {
					await ensurePage('/stations', window.location.pathname);
					if (isMobile()) {
						closeLeftSidebar();
					} else {
						openLeftSidebar();
						await scrollToHandler('#sensor-descriptions');
					}
				}
			} satisfies StepOptions
		].map((originalStep, idx, arr) => {
			const isFirst = idx === 0;
			const isLast = idx === arr.length - 1;
			const step = originalStep as StepOptions;
			return {
				...step,
				buttons: step.buttons || [
					...(isLast ? [] : [buttons.cancelButton]),
					...(isFirst ? [] : [buttons.prevButton]),
					...(isLast ? [buttons.restartButton, buttons.finishButton] : [buttons.nextButton])
				],
				attachTo:
					step.attachTo &&
					({
						on: 'auto',
						...step.attachTo
					} satisfies StepOptions['attachTo']),
				when: {
					show() {
						if (!t) return;
						const currentStep = t.getCurrentStep();
						if (!currentStep) return;
						const currentEl = currentStep.getElement();
						const footer = currentEl?.querySelector('.shepherd-footer') as HTMLElement;
						if (!footer) return;
						const currentStepIndex = t.steps.indexOf(currentStep);
						const totalSteps = t.steps.length;
						const stepsText = $LL.welcome.tourSteps.progress({
							currentStep: currentStepIndex + 1,
							totalSteps
						});
						const stepsSpan = document.createElement('span');
						footer.classList.add('flex', 'items-center');
						stepsSpan.classList.add(
							'text-sm',
							'text-muted-foreground',
							'w-full',
							'whitespace-nowrap'
						);
						stepsSpan.innerText = stepsText;
						footer.insertBefore(stepsSpan, footer.firstChild);
					}
				}
			} satisfies StepOptions;
		});
		if (t.steps.length === 0) {
			t.addSteps(steps);
		} else if (t.steps.length === steps.length) {
			t.steps.forEach((step, idx) => step.updateStepOptions(steps[idx]));
		}
	}

	$effect(() => {
		tour && initTour(tour);
	});

	type TourSettings = {
		pagePath: string;
		unit: string;
		datavisType: 'day' | 'hour' | 'range';
		rangeStart: number;
		rangeEnd: number;
		sidebarState?: SidebarState;
		dayValue: number;
		minMaxAvg: 'min' | 'max' | 'avg';
		hour: number;
		heatStressUnit: 'utci' | 'pet';
	};
	let initialSettings: TourSettings;
	const tourOptimalSettings = $derived({
		pagePath: '/',
		unit: 'utci',
		datavisType: 'hour',
		rangeStart: -10,
		rangeEnd: 0,
		dayValue: -2,
		minMaxAvg: 'avg',
		hour: getHours(today()),
		heatStressUnit: 'utci'
	} satisfies TourSettings);

	function saveInitialSettings() {
		const pagePath = window.location.pathname.replace(`/${$locale}`, '') || '/';
		initialSettings = {
			pagePath,
			unit: $unit,
			datavisType: $datavisType,
			rangeStart: $rangeStart,
			rangeEnd: $rangeEnd,
			dayValue: $dayValue,
			minMaxAvg: $minMaxAvg,
			hour: $hour,
			heatStressUnit: $heatStressUnit as 'utci' | 'pet'
		};
	}

	async function applySettings(stgns?: TourSettings) {
		if (!stgns) return;
		if (stgns.pagePath) {
			await ensurePage(stgns.pagePath, page.url.pathname);
		}
		updateUnit(stgns.unit);
		udpateDatavisType(stgns.datavisType);
		udpateRangeStart(stgns.rangeStart);
		updateRangeEnd(stgns.rangeEnd);
		udpateDay(stgns.dayValue);
		updateMinMaxAvg(stgns.minMaxAvg);
		$updateHour(stgns.hour);
		updateHeatStressUnit(stgns.heatStressUnit);
	}

	const handleClose = () => {
		localStorage.setItem('welcome-opened', 'false');
		opened = false;
	};

	const handleOpen = () => {
		localStorage.setItem('welcome-opened', 'true');
		opened = true;
	};

	async function onTourStart() {
		saveInitialSettings();

		ensurePage('/', window.location.pathname);
	}

	function onTourActive() {
		applySettings(tourOptimalSettings);
	}

	function onTourEnd() {
		applySettings(initialSettings);
	}
</script>

<section
	class={cn(
		'relative flex flex-col gap-2 p-6 transition-all',
		'bg-muted',
		opened ? 'py-6' : 'pb-0 pt-4'
	)}
>
	{#if opened}
		<h2 class="text-2xl font-semibold">{$LL.welcome.title()}</h2>
		{#each Object.entries($LL.welcome.text) as [key, paragraph] (key)}
			<p class="mb-2">{paragraph()}</p>
		{/each}
		<Button
			size="icon"
			on:click={handleClose}
			class="absolute right-4 top-6 rounded-full text-muted-foreground"
			variant="ghost"
		>
			<X />
		</Button>
		<div class="flex gap-4">
			<Button on:click={handleClose}>
				{$LL.welcome.buttons.confirm()}
			</Button>
			<Button variant="outline" on:click={() => tour?.start()}>
				{$LL.welcome.buttons.launchTour()}
			</Button>
		</div>
	{:else}
		<Button
			variant="ghost"
			class="-ml-3 mb-1 flex h-fit w-fit cursor-pointer items-center gap-2 py-2 text-left text-sm"
			size="sm"
			on:click={handleOpen}
		>
			<ArrowDown class="size-4" />
			{$LL.welcome.expandButtonLabel()}
		</Button>
	{/if}
</section>

<style>
	:global(.shepherd-content) {
		--shepherd-padding: 1.25rem;
		border: 1px solid hsl(var(--border));
	}

	:global(.shepherd-element) {
		--tw-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
		--tw-shadow-colored:
			0 10px 15px -3px var(--tw-shadow-color), 0 4px 6px -4px var(--tw-shadow-color);
		box-shadow:
			var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
		max-width: calc(var(--leftSidebarWidth) - 3rem);
		width: 30rem;
	}

	:global(.shepherd-modal-overlay-container path) {
		fill: hsl(var(--foreground));
		stroke: hsl(var(--primary));
		stroke-width: 4px;
	}

	:global(html.dark .shepherd-modal-overlay-container path) {
		fill: hsl(var(--background));
	}

	:global(.shepherd-button) {
		border: 1px solid hsl(var(--primary));
		color: hsl(var(--primary-foreground));
		background: hsl(var(--primary));
		border-radius: calc(var(--radius) - 2px);
		padding: 0.5rem 1rem;
		width: fit-content;
		font-weight: 600;
	}

	:global(.shepherd-button:not(:disabled):hover) {
		background: hsl(var(--primary) / 0.8);
		color: hsl(var(--primary-foreground));
		border: 1px solid hsl(var(--primary));
	}

	:global(.shepherd-button:not(:disabled):focus-visible) {
		outline: none;
		--tw-ring-offset-width: 2px;
		--tw-ring-color: hsl(var(--ring) / var(--tw-ring-opacity, 1));
		--tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width)
			var(--tw-ring-offset-color);
		--tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width))
			var(--tw-ring-color);
		box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
	}

	:global(.shepherd-button.shepherd-button-secondary) {
		background: hsl(var(--background));
		border: 1px solid hsl(var(--border));
		color: hsl(var(--foreground));
		font-weight: 400;
		white-space: nowrap;
	}

	:global(.shepherd-button.shepherd-button-secondary:not(:disabled):hover) {
		background: hsl(var(--muted));
		color: hsl(var(--foreground));
		border: 1px solid hsl(var(--border));
	}

	:global(
		.shepherd-has-title .shepherd-content .shepherd-header,
		.shepherd-element,
		.shepherd-title,
		.shepherd-text
	) {
		background: hsl(var(--background));
		color: hsl(var(--foreground));
	}

	:global(.shepherd-has-title .shepherd-content .shepherd-header) {
		padding: var(--shepherd-padding);
		padding-bottom: 0;
	}

	:global(.shepherd-header, .shepherd-text, .shepherd-footer) {
		padding-inline: var(--shepherd-padding);
	}

	:global(.shepherd-footer) {
		padding-block: calc(var(--shepherd-padding) * 0.75);
		margin-top: var(--shepherd-padding);
		border-top: 1px solid hsl(var(--border));
		background: hsl(var(--muted));
	}

	:global(.shepherd-title) {
		font-weight: 600;
		font-size: 1.25rem;
		line-height: 1.75rem;
		max-width: 100%;
	}

	:global(.shepherd-text) {
		font-size: inherit;
		line-height: inherit;
	}

	:global(.shepherd-arrow:before) {
		background: transparent;
	}
</style>

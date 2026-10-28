<script lang="ts">
	import LL from '#i18n/i18n-svelte.js';
	import { unit } from '#lib/stores/uiStore.js';
	import { today } from '#lib/utils/dateUtil.js';
	import { format } from 'date-fns';
	// the fork of html2canvas parses the oklab() and color-mix() colors of tailwind 4
	import html2canvas from 'html2canvas-pro';
	import { Download, EllipsisVertical, LoaderCircle } from '@lucide/svelte';
	import { mode } from 'mode-watcher';
	import { Button } from './ui/button';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuTrigger
	} from './ui/dropdown-menu';

	type Props = {
		disableExport?: boolean;
		chartExportId?: string;
		chartExportFilename?: string;
		onChartExportStart?: () => void;
		onChartExportEnd?: () => void;
	};

	const {
		disableExport = false,
		chartExportId,
		chartExportFilename = 'chart.png',
		onChartExportStart = () => {},
		onChartExportEnd = () => {}
	}: Props = $props();

	let isExporting = $state(false);

	function wrappedOnChartExportStart() {
		isExporting = true;
		onChartExportStart();
	}
	function wrappedOnChartExportEnd() {
		isExporting = false;
		onChartExportEnd();
	}

	const exportChart = $derived(async () => {
		wrappedOnChartExportStart();
		if (!chartExportId) return wrappedOnChartExportEnd();
		const chart = document.querySelector(`#${chartExportId}`) as HTMLElement;
		if (!chart) return wrappedOnChartExportEnd();
		const canvas = await html2canvas(chart, {
			scale: 4,
			removeContainer: true,
			backgroundColor: mode.current === 'dark' ? '#030816' : '#ffffff',
			ignoreElements: (el) => {
				return el.classList.contains('chart-export-ignore');
			},
			onclone: (_doc, el) => {
				const legendLabels = el.querySelectorAll('.chart-legend-label');
				for (const label of legendLabels) {
					label.classList.add('-translate-y-1/2');
				}
				el.classList.remove('border', 'border-b');
				el.classList.add('border-transparent');
			}
		});
		const link = document.createElement('a');
		link.download = `${chartExportFilename}-${$unit}-${format(today(), 'yyyy-MM-dd-HH-mm')}.png`;
		canvas.setAttribute('preserveDrawingBuffer', 'true');
		link.href = canvas.toDataURL();
		link.click();
		link.remove();
		wrappedOnChartExportEnd();
	});
</script>

{#if chartExportId}
	<DropdownMenu>
		<DropdownMenuTrigger disabled={disableExport || isExporting}>
			<Button variant="ghost" size="icon" disabled={disableExport} class="chart-export-ignore">
				{#if isExporting}
					<LoaderCircle class="size-6 animate-spin" />
				{:else}
					<EllipsisVertical class="size-6" />
				{/if}
			</Button>
		</DropdownMenuTrigger>
		<DropdownMenuContent class="chart-export-ignore">
			<DropdownMenuItem class="flex cursor-pointer items-center gap-8" onclick={exportChart}>
				{$LL.generic.chartExportButtonLabel()}
				<Download class="size-5 text-muted-foreground" />
			</DropdownMenuItem>
		</DropdownMenuContent>
	</DropdownMenu>
{/if}

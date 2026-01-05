<script lang="ts">
    import { LL } from '$i18n/i18n-svelte';
	import { ExternalLink } from 'lucide-svelte';
	import Button from './ui/button/button.svelte';
	import { PUBLIC_API_BASE_URL } from '$env/static/public';

	import {
		PopoverTooltip,
		PopoverTooltipContent,
		PopoverTooltipTrigger
	} from './ui/popover-tooltip';

	type Props = {
		id: string;
	};

	let { id }: Props = $props();

	function openDetails() {
		window.open(`${PUBLIC_API_BASE_URL}/v1/stations/metadata/${id}`, '_blank');
	}
</script>

<PopoverTooltip openDelay={10} disableHoverableContent>
	<PopoverTooltipTrigger tabindex={-1}>
		<Button
			variant="ghost"
			size="icon"
			class="p-0"
            onclick={openDetails}
		>
			<ExternalLink class="size-5 shrink-0 text-muted-foreground" />
		</Button>
	</PopoverTooltipTrigger>
	<PopoverTooltipContent>
		{$LL.pages.stations.table.headers.metadataTooltip()}
	</PopoverTooltipContent>
</PopoverTooltip>

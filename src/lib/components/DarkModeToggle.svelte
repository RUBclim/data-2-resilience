<script lang="ts">
	import { LL } from '$i18n/i18n-svelte';

	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { resetMode, setMode, mode } from 'mode-watcher';
	import { Moon, Sun, Monitor } from 'lucide-svelte';
	import { cn } from '$lib/utils';
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger asChild aria-label="Light/Dark Theme Switcher">
		{#snippet children({ builder })}
			<Button builders={[builder]} variant="outline" size="icon">
				<Sun
					class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
				/>
				<Moon
					class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
				/>
				<span class="sr-only">Toggle theme</span>
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="end">
		<DropdownMenu.Item on:click={() => setMode('light')} class="flex items-center gap-2">
			<Sun class="size-5" />
			<span class={cn($mode === 'light' && 'font-semibold')}>{$LL.themeSwitch.light()}</span>
		</DropdownMenu.Item>
		<DropdownMenu.Item on:click={() => setMode('dark')} class="flex items-center gap-2">
			<Moon class="size-5" />
			<span class={cn($mode === 'dark' && 'font-semibold')}>{$LL.themeSwitch.dark()}</span>
		</DropdownMenu.Item>
		<DropdownMenu.Item on:click={() => resetMode()} class="flex items-center gap-2">
			<Monitor class="size-5" />
			<span class={cn(!$mode && 'font-semibold')}>{$LL.themeSwitch.system()}</span>
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>

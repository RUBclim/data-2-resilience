<script lang="ts">
	import { LL } from '#i18n/i18n-svelte.js';

	import { Button } from '#lib/components/ui/button/index.js';
	import * as DropdownMenu from '#lib/components/ui/dropdown-menu/index.js';
	import { resetMode, setMode, mode } from 'mode-watcher';
	import { Moon, Sun, Monitor } from '@lucide/svelte';
	import { cn } from '#lib/utils.js';
</script>

<DropdownMenu.Root>
	<!-- bits-ui 0.x dropped the aria-label of asChild triggers: bits-ui 2 would render it and change the
	accessible name (KNOWN BUG in the e2e tests), so it stays off for now -->
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="outline" size="icon">
				<Sun
					class="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90"
				/>
				<Moon
					class="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"
				/>
				<span class="sr-only">Toggle theme</span>
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="end">
		<DropdownMenu.Item onSelect={() => setMode('light')} class="flex items-center gap-2">
			<Sun class="size-5" />
			<span class={cn(mode.current === 'light' && 'font-semibold')}>{$LL.themeSwitch.light()}</span>
		</DropdownMenu.Item>
		<DropdownMenu.Item onSelect={() => setMode('dark')} class="flex items-center gap-2">
			<Moon class="size-5" />
			<span class={cn(mode.current === 'dark' && 'font-semibold')}>{$LL.themeSwitch.dark()}</span>
		</DropdownMenu.Item>
		<DropdownMenu.Item onSelect={() => resetMode()} class="flex items-center gap-2">
			<Monitor class="size-5" />
			<span class={cn(!mode.current && 'font-semibold')}>{$LL.themeSwitch.system()}</span>
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>

<script lang="ts">
	import { page } from '$app/state';
	import LL, { locale } from '#i18n/i18n-svelte.js';
	import { isLeftSidebarOpened } from '#lib/stores/uiStore.js';
	import { cn } from '#lib/utils.js';
	import { onMount } from 'svelte';
	import WelcomeMessage from './WelcomeMessage.svelte';
	interface Props {
		children?: import('svelte').Snippet;
	}

	const { children }: Props = $props();

	// biome-ignore lint/style/useConst: <explanation>
	let navElement: HTMLElement | undefined = $state();
	const fullPath = $derived(page.url.pathname.replace(`/${$locale}`, ''));
	const tabs = $derived([
		{
			slug: 'measurements',
			name: $LL.navigation.tabs.actualMeasurements(),
			isActive: fullPath === '/' || fullPath === ''
		},
		{
			slug: 'heat-stress',
			name: $LL.navigation.tabs.heatStress(),
			isActive: fullPath === '/heat-stress'
		},
		{
			slug: 'stations',
			name: $LL.navigation.tabs.stations(),
			isActive: fullPath === '/stations'
		}
	]);

	const isAboutPage = $derived(page.url.pathname.startsWith(`/${$locale}/about`));
	const showLeftSidebar = $derived(!isAboutPage && $isLeftSidebarOpened);

	const urlQuery = $derived(page.url.searchParams.toString());

	onMount(() => {
		document.getElementById('left-sidebar-scroll-container')?.addEventListener('scroll', () => {
			const scrollTop = document.getElementById('left-sidebar-scroll-container')?.scrollTop;
			if (!navElement) return;
			const { top, height } = navElement.getBoundingClientRect();
			if (scrollTop && scrollTop > Math.abs(top + height + 10)) {
				navElement.classList.add('shadow-2xl');
			} else {
				navElement.classList.remove('shadow-2xl');
			}
		});
	});
</script>

{#if showLeftSidebar}
	<aside class={cn('w-(--leftSidebarWidth)', 'transition-all duration-300 ease-in-out')}>
		<div
			class={cn(
				'sidebar-content absolute top-0 left-0 z-50',
				'h-[calc(100vh-var(--headerHeight,5rem))] w-(--leftSidebarWidth)',
				'overflow-x-clip overflow-y-auto',
				'transition-all duration-300 ease-in-out'
			)}
			id="left-sidebar-scroll-container"
			inert={!showLeftSidebar}
		>
			<WelcomeMessage />
			<nav
				id="navigation"
				class={cn(
					'sticky top-0 z-50 border-b border-border bg-muted',
					'pt-1 shadow-black/10 transition-shadow duration-1000'
				)}
				bind:this={navElement}
			>
				<ul
					class={cn(
						'flex w-(--leftSidebarWidth) translate-y-px',
						'overflow-x-auto overflow-y-clip pt-2 transition-all',
						'has-focus-visible:overflow-visible'
					)}
				>
					{#each tabs as tab (tab.slug)}
						<li
							id={`navigation-tab-${tab.slug}`}
							class={cn(
								'relative -mb-px -ml-px flex',
								tab.isActive && 'z-10',
								'has-focus-visible:z-20'
							)}
						>
							<a
								href={[
									`/${$locale}`,
									tab.slug === tabs[0].slug ? '' : `/${tab.slug}`,
									urlQuery ? `?${urlQuery}` : ''
								].join('')}
								class={cn(
									'focusable px-4 pt-3 pb-2 transition focus-visible:rounded-lg',
									'border border-transparent text-nowrap hover:z-50 focus-visible:z-10',
									tab.slug === tabs[0].slug ? 'rounded-tr-lg pl-6' : ' rounded-t-lg',
									tab.isActive &&
										cn(
											'border-border border-t-primary border-b-background bg-background font-semibold',
											'shadow-[inset_0_1px_0_0_hsl(var(--primary)),0_-1px_0_0_hsl(var(--primary))]'
										),
									tab.isActive && tab.slug === tabs[0].slug && 'border-l-background',
									!tab.isActive &&
										cn(
											'hover:border-border hover:border-b-border',
											'hover:bg-background',
											'border-b-2 focus-visible:border-b'
										)
								)}>{tab.name}</a
							>
						</li>
					{/each}
				</ul>
			</nav>
			<section class="bg-background p-6 pb-48">
				{@render children?.()}
			</section>
		</div>
	</aside>
{/if}

<style>
	aside {
		/* base styles */

		&.closed {
			width: 0;
			/* closed state styles */
		}

		&.simple {
			width: 320px;
			/* simple state styles */
		}

		&.large {
			width: 600px;
			/* large state styles */
		}
	}
</style>

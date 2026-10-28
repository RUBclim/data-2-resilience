import { type VariantProps, tv } from 'tailwind-variants';

import { cn } from '#lib/utils.js';
import Description from './alert-description.svelte';
import Title from './alert-title.svelte';
import Root from './alert.svelte';

export const alertVariants = tv({
	base: cn('flex gap-3 justify-between', 'relative w-full rounded-lg border p-4'),

	variants: {
		variant: {
			default: 'bg-background text-foreground',
			destructive: cn(
				'border-destructive text-destructive-foreground bg-destructive/5 dark:bg-destructive/20 [&>svg]:text-destructive'
			),
			warning: cn(
				'border-warning text-warning-foreground bg-warning/5 dark:bg-warning/20 [&>svg]:text-warning'
			)
		}
	},
	defaultVariants: {
		variant: 'default'
	}
});

export type Variant = VariantProps<typeof alertVariants>['variant'];
export type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

export {
	//
	Root as Alert,
	Description as AlertDescription,
	Title as AlertTitle,
	Description,
	Root,
	Title
};

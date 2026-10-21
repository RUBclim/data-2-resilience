import { z } from 'zod';

export const responseSchema = z.object({
	type: z.literal('FeatureCollection'),
	features: z.array(
		z.object({
			id: z.string(),
			type: z.literal('Feature'),
			bbox: z.array(z.number()).length(4),
			properties: z.object({
				text: z.string(),
				score: z.number()
			}),
			geometry: z.object({
				type: z.literal('Point'),
				coordinates: z.array(z.number())
			})
		})
	)
});
export type AddressFeature = z.infer<typeof responseSchema>['features'][0];

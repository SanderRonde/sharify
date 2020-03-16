declare module "human-readable-ids" {
	export const humanReadableIds: {
		random(): string
	}

	export const hri: typeof humanReadableIds;
}
export const getPathname = (path: string): string => path.split('?')[0] as string

export const containsQueryParams = (urlSearchParams: URLSearchParams): boolean =>
	Array.from(urlSearchParams.values()).length > 0

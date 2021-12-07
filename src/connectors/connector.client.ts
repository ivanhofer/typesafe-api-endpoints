import type { ApiSchema, MethodsFromSchema, Params, StringStringRecord } from '../types/types'
import { ApiError } from '../errors'
import { containsQueryParams } from '../utils'
import { GetHeaders, CallApi, Client, DoesNotEndWithSlash } from '../types/types.client'

const getPathFromEndpoint = (endpoint: string) => endpoint.substring(0, Math.max(0, endpoint.indexOf('?')) || endpoint.length)

const paramsToString = (params: StringStringRecord = {}) => {
	const entries = Object.entries(params)
	if (!entries.length) return ''

	const urlSearchParams = new URLSearchParams()
	entries.forEach(([name, value]) => value && urlSearchParams.append(name, value))

	if (!containsQueryParams(urlSearchParams)) return ''

	return `?${urlSearchParams.toString()}`
}

const replaceSlugs = (endpoint: string, slugs: StringStringRecord) => {
	if (!slugs) return endpoint

	let endpointWithReplacedSlugs = endpoint as string

	Object.entries(slugs).forEach(([key, value]) => {
		if (!value) {
			throw new ApiError(400, `no value set for slug '${key}' when calling endpoint '${endpoint}'`)
		}

		endpointWithReplacedSlugs = endpointWithReplacedSlugs.replace(`{${key}}`, value)
	})

	return endpointWithReplacedSlugs
}

const makeFetchCall = async <Schema extends ApiSchema, Method extends MethodsFromSchema<Schema>, T = unknown>(
	fetchFn: typeof fetch,
	apiEndpoint: string,
	method: Method,
	endpoint: string,
	slugs: StringStringRecord,
	query: StringStringRecord,
	headers: Headers,
	body: unknown,
): Promise<T> => {
	const url = `${apiEndpoint}/${replaceSlugs(getPathFromEndpoint(endpoint), slugs)}${paramsToString(query)}`
	const response = await fetchFn(url, {
		method,
		headers: {
			'content-type': 'application/json',
			...headers
		},
		...(body ? { body: JSON.stringify(body) } : {}),
	}).catch((error) => {
		throw new ApiError(400, error)
	})

	if (!response.ok) {
		throw new ApiError(response.status, response.statusText)
	}

	return await response.json()
}

function initCallApi<Schema extends ApiSchema, Method extends MethodsFromSchema<Schema>>(
	fetchFn: typeof fetch,
	apiEndpoint: string,
	method: Method,
	getHeaders?: GetHeaders<Schema>,
): CallApi<Schema, Method> {
	return async (endpoint: any, params: any, body: any = undefined): Promise<any> => {
		let error: ApiError | undefined = undefined

		const { slugs, query } = (params || {}) as Params

		const headers = getHeaders ? await getHeaders(method, endpoint) : new Headers()

		const data = await makeFetchCall(fetchFn, apiEndpoint, method, endpoint, slugs || {}, query || {}, headers, body).catch(
			(apiError: ApiError) => {
				error = apiError

				return undefined
			},
		)

		return { data, error }
	}
}

export const createTypesafeApiEndpointsClient = <Schema extends ApiSchema>(
	apiEndpoint: DoesNotEndWithSlash,
	fetchFn: typeof fetch,
	getHeaders?: GetHeaders<Schema>
): Client<Schema> => ({
	GET: initCallApi(fetchFn, apiEndpoint, 'GET' as any, getHeaders),
	POST: initCallApi(fetchFn, apiEndpoint, 'POST' as any, getHeaders),
	PUT: initCallApi(fetchFn, apiEndpoint, 'PUT' as any, getHeaders),
	PATCH: initCallApi(fetchFn, apiEndpoint, 'PATCH' as any, getHeaders),
	DELETE: initCallApi(fetchFn, apiEndpoint, 'DELETE' as any, getHeaders),
})
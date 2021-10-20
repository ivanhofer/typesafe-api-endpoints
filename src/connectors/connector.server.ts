import { EndpointNotFoundError } from '../errors'
import type { ApiSchema, EndpointStringsFromSchema, HandlerFn, MethodsFromSchema, StringRecord, StringStringRecord } from '../types/types'
import { getPathname } from '../utils'
import { ServerHandler, MethodHandler, Server } from '../types/types.server'

const REGEX_SLUGS = /\{[^\\}]+\}/g

const endpointToRegexpPattern = (endpoint: string) =>
	new RegExp(`^${getPathname(endpoint).replace(REGEX_SLUGS, (s) => `(?<${s.substr(1, s.length - 2)}>[^/]+)`)}$`)

const handleMethod = <Schema extends ApiSchema, Method extends MethodsFromSchema<Schema>, EndpointStrings extends EndpointStringsFromSchema<Schema>>(
	method: Method,
	handler: ServerHandler<Schema>,
): MethodHandler<Schema, Method, EndpointStrings> => {
	const endpointMap: [EndpointStrings[Method], RegExp][] = Object.keys(handler[method]).map((endpoint) => [
		endpoint as EndpointStrings[Method],
		endpointToRegexpPattern(endpoint),
	])

	return async (endpoint, urlSearchParams, body) => {
		const query = {} as StringStringRecord
		urlSearchParams.forEach((value, name) => (query[name] = value))

		let parsedEndpoint: EndpointStrings[Method] = '' as EndpointStrings[Method]
		let slugs: StringRecord<string> | undefined = undefined

		for (const [path, regexp] of endpointMap) {
			const result = regexp?.exec(endpoint as string)
			if (!result) continue

			parsedEndpoint = path
			slugs = result.groups && Object.fromEntries(Object.entries(result.groups || {}))
			break
		}

		// @ts-expect-error
		const handlerFn: HandlerFn | undefined = handler[method][parsedEndpoint]
		if (!handlerFn) {
			throw new EndpointNotFoundError(endpoint as string)
		}

		const result = await handlerFn({ slugs, query, body })

		return JSON.stringify(result || null) as any
	}
}

export const createTypesafeApiEndpointsServer = <Schema extends ApiSchema>(handler: ServerHandler<Schema>): Server<Schema> => ({
	GET: handleMethod('GET' as any, handler),
	POST: handleMethod('POST' as any, handler),
	PUT: handleMethod('PUT' as any, handler),
	PATCH: handleMethod('PATCH' as any, handler),
	DELETE: handleMethod('DELETE' as any, handler),
}) as unknown as Server<Schema>

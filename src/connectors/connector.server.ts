import { EndpointNotFoundError } from '../errors'
import type { ApiSchema, EndpointStringsFromSchema, HandlerFn, MethodsFromSchema, StringRecord, StringStringRecord } from '../types/types'
import { getPathname } from '../utils'
import { ServerHandler, MethodHandler, Server, DoBeforeFunction, StatusResponse, DoAfterFunction } from '../types/types.server'
import { Adapters } from '../adapters/adapter-types'

const REGEX_SLUGS = /\{[^\\}]+\}/g

const endpointToRegexpPattern = (endpoint: string) =>
	new RegExp(`^${getPathname(endpoint).replace(REGEX_SLUGS, (s) => `(?<${s.substr(1, s.length - 2)}>[^/]+)`)}$`)

const handleMethod = <Schema extends ApiSchema, Adapter extends Adapters, Method extends MethodsFromSchema<Schema>, EndpointStrings extends EndpointStringsFromSchema<Schema>>(
	method: Method,
	handler: ServerHandler<Schema, Adapter>,
	doBefore?: DoBeforeFunction,
	doAfter?: DoAfterFunction,
): MethodHandler<Schema, Method, EndpointStrings> => {
	const endpointMap: [EndpointStrings[Method], RegExp][] = Object.keys(handler[method] || []).map((endpoint) => [
		endpoint as EndpointStrings[Method],
		endpointToRegexpPattern(endpoint),
	])

	return async (endpoint, urlSearchParams, body, additionalPayload) => {
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

		doBefore && await doBefore({ method, endpoint: parsedEndpoint })

		const start = Date.now()
		const result = await handlerFn({ slugs, query, body, ...additionalPayload }).catch(error => {
			console.error(error)
			throw error
		})
		const duration = Date.now() - start

		doAfter && await doAfter({ method, endpoint: parsedEndpoint, duration })

		if (result instanceof StatusResponse) {
			throw result
		}

		return JSON.stringify(result || null) as any
	}
}

export const createTypesafeApiEndpointsServer = <Schema extends ApiSchema, Adapter extends Adapters>(handler: ServerHandler<Schema, Adapter>, doBefore?: DoBeforeFunction, doAfter?: DoAfterFunction): Server<Schema> => ({
	GET: handleMethod('GET' as any, handler, doBefore, doAfter),
	POST: handleMethod('POST' as any, handler, doBefore, doAfter),
	PUT: handleMethod('PUT' as any, handler, doBefore, doAfter),
	PATCH: handleMethod('PATCH' as any, handler, doBefore, doAfter),
	DELETE: handleMethod('DELETE' as any, handler, doBefore, doAfter),
}) as unknown as Server<Schema>

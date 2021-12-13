import type { RequestHandler } from '@sveltejs/kit'
import { ApiError } from '../index'
import { createTypesafeApiEndpointsServer } from '../connectors/connector.server'
import { EndpointNotFoundError } from '../errors'
import type { ApiSchema, EndpointStringsFromSchema, MethodsFromSchema } from '../types/types'
import { DoAfterFunction, DoBeforeFunction, ServerHandler, StatusResponse } from '../types/types.server'

type HandlerMethod = (...args: unknown[]) => Promise<any>

export const sveltekit = <
	Schema extends ApiSchema,
	Methods extends MethodsFromSchema<Schema> = MethodsFromSchema<Schema>,
	Endpoints extends EndpointStringsFromSchema<Schema> = EndpointStringsFromSchema<Schema>
	>(handler: ServerHandler<Schema, 'SvelteKit', any>, doBefore?: DoBeforeFunction, doAfter?: DoAfterFunction) => {

	const typesafeApiEndpointsServer = createTypesafeApiEndpointsServer<Schema, 'SvelteKit'>(handler, doBefore, doAfter)

	const createApiRouteHandler = <Method extends Methods>(method: Method): RequestHandler =>
		async ({ params: { route }, query, body, locals }) => {
			let error: unknown = undefined

			const data = await (typesafeApiEndpointsServer[method] as HandlerMethod)(
				route as Endpoints[Method],
				query,
				body,
				{ locals },
			).catch((e) => {
				error = e
				return undefined
			})

			if (data) {
				return { body: data }
			}

			if (error instanceof StatusResponse) {
				return { status: error.status, body: error.data }
			}

			if (error instanceof EndpointNotFoundError) {
				return { status: 404 }
			}

			if (error instanceof ApiError) {
				return { status: error.status, body: error.statusText }
			}

			return { status: 500, body: (error as Error)?.message || JSON.stringify(error) }
		}

	return {
		get: createApiRouteHandler('GET' as Methods),
		post: createApiRouteHandler('POST' as Methods),
		put: createApiRouteHandler('PUT' as Methods),
		patch: createApiRouteHandler('PATCH' as Methods),
		del: createApiRouteHandler('DELETE' as Methods)
	}
}

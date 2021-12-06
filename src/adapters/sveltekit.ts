import type { RequestHandler } from '@sveltejs/kit'
import { createTypesafeApiEndpointsServer } from '../connectors/connector.server'
import { EndpointNotFoundError } from '../errors'
import type { ApiSchema, EndpointStringsFromSchema, MethodsFromSchema } from '../types/types'
import { DoBeforeFunction, ServerHandler } from '../types/types.server'

type HandlerMethod = (...args: unknown[]) => Promise<any>

export const sveltekit = <
	Schema extends ApiSchema,
	Methods extends MethodsFromSchema<Schema> = MethodsFromSchema<Schema>,
	Endpoints extends EndpointStringsFromSchema<Schema> = EndpointStringsFromSchema<Schema>
>(handler: ServerHandler<Schema>, doBefore?: DoBeforeFunction) => {

	const typesafeApiEndpointsServer = createTypesafeApiEndpointsServer<Schema>(handler, doBefore)

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

			if (error instanceof EndpointNotFoundError) {
				return { status: 404 }
			}

			return { status: 500 }
		}

	return {
		get: createApiRouteHandler('GET' as Methods),
		post: createApiRouteHandler('POST' as Methods),
		put: createApiRouteHandler('PUT' as Methods),
		patch: createApiRouteHandler('PATCH' as Methods),
		del: createApiRouteHandler('DELETE' as Methods)
	}
}

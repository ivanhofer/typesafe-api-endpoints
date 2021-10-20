import { createTypesafeApiEndpointsClient } from '../src/connectors/connector.client'
import { createTypesafeApiEndpointsServer } from '../src/connectors/connector.server'
import type { CreateTypesafeApiEndpointsSchema } from '../src/types/types'
import { ServerHandler } from '../src/types/types.server'

// schema -------------------------------------------------------------------------------------------------------------

type Schema = CreateTypesafeApiEndpointsSchema<{
	GET: {
		test: number
		test123: number
		'test/{id}': string
		'test/{id}/subpath?filter&search': { test: string }
		'test/{id}/subpath/{subId}?test&asd': { id: string; subId: string }
	}
	POST: {
		'product/{productId}': (t: { color: string }) => boolean
	}
}>

// server -------------------------------------------------------------------------------------------------------------

const handler: ServerHandler<Schema> = {
	GET: {
		"test/{id}": async () => null as any,
		"test": async () => null as any,
		"test/{id}/subpath/{subId}?test&asd": async () => null as any,
		"test/{id}/subpath?filter&search": async () => null as any,
		"test123": async () => null as any,
	},
	POST: {
		"product/{productId}": async () => null as any
	}
}

const typesafeApiEndpointsServer = createTypesafeApiEndpointsServer<Schema>(handler)

const a = typesafeApiEndpointsServer.GET('test', new URLSearchParams(), null as never)
const a1 = typesafeApiEndpointsServer.POST('product/{productId}', new URLSearchParams(), { color: '' })

// client -------------------------------------------------------------------------------------------------------------

const typesafeApiEndpointsClient = createTypesafeApiEndpointsClient<Schema>('api/', fetch)

const x1 = typesafeApiEndpointsClient.GET('test', undefined)
const x2 = typesafeApiEndpointsClient.POST('product/{productId}', { slugs: { productId: '12' }, query: undefined }, { color: '12' })

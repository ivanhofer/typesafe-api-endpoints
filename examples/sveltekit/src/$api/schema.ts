import type { CreateTypesafeApiEndpointsSchema } from 'typesafe-api-endpoints'
import type { Product } from './api.models'

// schema -------------------------------------------------------------------------------------------------------------

export type Schema = CreateTypesafeApiEndpointsSchema<{
	GET: {
		'products': Product[]
		'products?limit': Product[]
		'product/{id}': Product
		'products?search': Product[]
	}
	POST: {
		'product': (product: Product) => boolean
	},
	PUT: {
		'product/{productId}': (product: Partial<Product>) => boolean
	}
}>

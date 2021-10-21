import { createTypesafeApiEndpointsClient } from '../src/connectors/connector.client'
import { createTypesafeApiEndpointsServer } from '../src/connectors/connector.server'
import type { CreateTypesafeApiEndpointsSchema } from '../src/types/types'
import { ServerHandler } from '../src/types/types.server'

// dummy data  --------------------------------------------------------------------------------------------------------

const product1: Product = {
	id: 0,
	name: 'p1',
	color: 'red'
}

const product2: Product = {
	id: 1,
	name: 'p1',
	color: 'green'
}

const product3: Product = {
	id: 2,
	name: 'p3',
	color: 'blue'
}

let products = [product1, product2, product3]

// schema -------------------------------------------------------------------------------------------------------------

type Product = {
	id: number
	name: string
	color: 'red' | 'green' | 'blue'
}

type Schema = CreateTypesafeApiEndpointsSchema<{
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

// server -------------------------------------------------------------------------------------------------------------

const handler: ServerHandler<Schema> = {
	GET: {
		"products": async () => products,
		"products?limit": async ({ query: { limit = Infinity } }) => products.slice(0, +limit),
		"product/{id}": async ({ slugs: { id } }) => products.find(({ id: productId }) => +id === productId),
		"products?search": async () => { throw new Error('not yet implemented') }
	},
	POST: {
		"product": async ({ body: product }) => {
			products = [...products, product]
			return true
		}
	},
	PUT: {
		"product/{productId}": async ({ slugs: { productId }, body: product }) => {
			let updated = false
			products = products.map(original => {
				let newValue: Product
				if (original.id === +productId) {
					newValue = { ...original, ...product }
					updated = true
				} else {
					newValue = original
				}
				return newValue
			})
			return updated
		}
	}
}

const typesafeApiEndpointsServer = createTypesafeApiEndpointsServer<Schema>(handler)

// you will probably write a generic wrapper around this

const s1 = typesafeApiEndpointsServer.GET('products', new URLSearchParams(), null as never)
const s2 = typesafeApiEndpointsServer.GET('product/{id}', new URLSearchParams('id=1'), null as never)
const s3 = typesafeApiEndpointsServer.PUT('product/{productId}', new URLSearchParams('productId=1'), { color: 'green' })

// client -------------------------------------------------------------------------------------------------------------

const typesafeApiEndpointsClient = createTypesafeApiEndpointsClient<Schema>('api/', fetch)

const fetchData = async () => {
	const { data: products } = await typesafeApiEndpointsClient.GET('products', undefined)

	const { data: product1 } = await typesafeApiEndpointsClient.GET('product/{id}', { slugs: { id: '2' }, query: undefined })

	const { error } = await typesafeApiEndpointsClient.GET('products?search', { query: { search: 'Test product' } })

	const { data: updateSuccessful } = await typesafeApiEndpointsClient.PUT('product/{productId}', { slugs: { productId: '1' }, query: undefined }, { color: 'green' })
}

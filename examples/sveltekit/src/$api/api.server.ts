import type { ServerHandler } from 'typesafe-api-endpoints'
import type { Product } from './api.models'
import type { Schema } from './schema'

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

// server -------------------------------------------------------------------------------------------------------------

export const handler: ServerHandler<Schema> = {
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

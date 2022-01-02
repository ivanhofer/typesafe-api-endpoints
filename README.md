# typesafe-api-endpoints

This is a proof of concept I have created to see how far we can take TypeScripts type inference to create a fully typesafe endpoints schema.

**Result: It works quiet well! (with TypeScript version 4.4.x)**

> Note: I have used it in a [`SvelteKit`](https://kit.svelte.dev/) production environment for a few months but recently switched to [`tRPC`](https://github.com/trpc/trpc) because I currently have no time to maintain this project.

## Usage:

1. First you need to define a `Schema` containing all HTTP methods, it's endpoints, slugs, query params and return types.
2. Then use the `Schema` to implement a `Server`-handler
3. Call the endpoints from the `Client`

### Schema

We can define a schema like:

```ts
type Schema = CreateTypesafeApiEndpointsSchema<{
   GET: {
      'products': Product[]
      'products?limit': Product[]
      'product/{id}': Product
   }
   POST: {
      'product': (product: Product) => boolean
   },
   PUT: {
      'product/{productId}': (product: Partial<Product>) => boolean
   }
}>
```

### Server

And can use the `Schema` type for our `server-handler` that forces us to implement all methods and it's endpoints:

```ts
export const handler: ServerHandler<Schema, 'SvelteKit'> = {
   GET: {
      'products': async () => {
         return products
      },
      'products?limit': async ({ query: { limit = Infinity } }) => {
         return products.slice(0, +limit)
      },
      'product/{id}': async ({ slugs: { id } }) => {
         return products.find(({ id: productId }) => +id === productId)
      }
   },
   POST: {
      'product': async ({ body: product }) => {
         // create logic
         return true
      }
   },
   PUT: {
      'product/{productId}': async ({ slugs: { productId }, body: product }) => {
         // update logic
         return true
      }
   }
}
```

### Client

We now can also create the `client`:

```ts
export const api = createTypesafeApiEndpointsClient<Schema>('api-endpoint', fetch)
```

Whenever we use `api` a request is made to the endpoint we have provided as the first argument (in this case : `/api-endpoint`)

We can now call all endpoints from the `api`-object and get fully typed

```ts
const loadData = async () => {
   const response = await api.GET('product/{id}', { slugs: { id: '123' }, query: undefined })

   if (response.error) {
      throw response.error
   }

   return response.data
}

const data = await loadData()
// => 'data' is of type 'Product'
```

> I could not get rid of needing to pass also `undefined` in some cases. I think the type definitions are to complex for TypeScript to resolve everything correctly.

## Examples

You can take a look ath the [`examples`](https://github.com/ivanhofer/typesafe-api-endpoints/tree/main/examples) folder to see an implementation of this library

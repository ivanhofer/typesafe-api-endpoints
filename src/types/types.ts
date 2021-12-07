// globals ------------------------------------------------------------------------------------------------------------

import { AdapterPayload, Adapters } from '../adapters/adapter-types'

type AllowedMethods = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

type FilterForAllowedMethods<Method> = Method extends AllowedMethods ? Method : never

export type AnyObject = {}

export type StringStringRecord = Record<string, string>

export type StringRecord<Type extends string> = {
	[key in Type]: string
}

type StringOnly<Type> = Type extends string ? Type : string

// public -------------------------------------------------------------------------------------------------------------

export type CreateTypesafeApiEndpointsSchema<Schema extends ApiSchema> = Schema

export type ApiSchema = {
	[key in AllowedMethods]?: {
		[path: string]: unknown
	}
}

// schema-parsing -----------------------------------------------------------------------------------------------------

export type MethodsFromSchema<Schema extends ApiSchema> = FilterForAllowedMethods<StringOnly<keyof Schema>>

export type EndpointStringsFromSchema<Schema extends ApiSchema> = {
	[Method in MethodsFromSchema<Schema>]: StringOnly<keyof Schema[Method]>
}

// params -------------------------------------------------------------------------------------------------------------

type ArrayToRecord<Slugs extends string[]> = Slugs extends [infer Slug, ...infer Rest]
	? Slug extends ''
	? never
	: StringRecord<Slug extends string ? Slug : ''> & ArrayToRecord<Rest extends string[] ? Rest : []>
	: AnyObject

export type ApiParams<Slugs extends string[] | undefined, Query extends string[] | undefined> = Slugs extends string[]
	? Query extends string[]
	? Slugs extends []
	? ArrayToRecord<Query> extends never
	? undefined
	: {
		query: ArrayToRecord<Query>
	}
	: {
		slugs: ArrayToRecord<Slugs>
		query: ArrayToRecord<Query>
	}
	: Slugs extends []
	? undefined
	: ArrayToRecord<Slugs> extends never
	? undefined
	: {
		slugs: ArrayToRecord<Slugs>
	}
	: Query extends string[]
	? Query extends []
	? undefined
	: ArrayToRecord<Query> extends never
	? undefined
	: {
		query: ArrayToRecord<Query>
	}
	: undefined


// handler ------------------------------------------------------------------------------------------------------------

export type HandlerFn<Adapter extends Adapters = 'none', Payload = unknown> = (args: Params<Adapter, Payload>) => Promise<unknown>

export type Params<Adapter extends Adapters = 'none', Payload = unknown> = {
	slugs: StringStringRecord | undefined
	query: StringStringRecord | undefined
	body: unknown | undefined
} & AdapterPayload<Payload>[Adapter]

// slugs-parsing ------------------------------------------------------------------------------------------------------

type ParseSlugsInner<Path extends string> = Path extends `${string}{${infer Slug}}${infer Rest}`
	? [Slug, ...ParseSlugs<Rest>]
	: []

export type ParseSlugs<Path extends string> = Path extends `${infer Endpoint}?${string}`
	? ParseSlugsInner<Endpoint>
	: ParseSlugsInner<Path>

// query-parsing ------------------------------------------------------------------------------------------------------

type ParseQueryInner<Path extends string> = Path extends `${infer Query}&${infer Rest}`
	? [Query, ...ParseQueryInner<Rest>]
	: [Path]

export type ParseQuery<Path extends string> = Path extends `${string}?${infer Query}`
	? ParseQueryInner<Query>
	: undefined

// result -------------------------------------------------------------------------------------------------------------

type GetReturnType<T> = T extends (...args: any) => any ? ReturnType<T> : T

export type ApiResult<
	Schema extends ApiSchema,
	Method extends MethodsFromSchema<Schema>,
	Endpoint extends EndpointStringsFromSchema<Schema>[Method],
	// @ts-expect-error
	> = GetReturnType<Schema[Method][Endpoint]>

// payload ------------------------------------------------------------------------------------------------------------

export type ApiPayload<
	Schema extends ApiSchema,
	Method extends MethodsFromSchema<Schema>,
	Endpoint extends EndpointStringsFromSchema<Schema>[Method],
	// @ts-expect-error
	> = Parameters<Schema[Method][Endpoint]>[0]



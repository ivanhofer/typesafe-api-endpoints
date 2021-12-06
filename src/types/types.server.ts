import { AdapterPayload, Adapters } from '../adapters/adapter-types'
import type {
	ApiParams,
	ApiPayload,
	ApiResult,
	ApiSchema,
	EndpointStringsFromSchema,
	MethodsFromSchema,
	ParseQuery,
	ParseSlugs
} from './types'

// public ------------------------------------------------------------------------------------------------------------

export type Server<Schema extends ApiSchema> = {
	[Method in MethodsFromSchema<Schema>]: MethodHandler<Schema, Method, EndpointStringsFromSchema<Schema>>
}

export class StatusResponse<T = never> {
	#status: number
	#data: T | undefined

	constructor(status: number, data?: T) {
		this.#status = status
		this.#data = data
	}

	get status(): number { return this.#status }

	get data(): string | undefined { return this.#data ? JSON.stringify(this.#data) : undefined }
}

// handler ------------------------------------------------------------------------------------------------------------

type WithBody<Schema extends ApiSchema, Method extends MethodsFromSchema<Schema>, Endpoint extends EndpointStringsFromSchema<Schema>[Method], ParamsType> =
	ParamsType extends undefined
	? { body: ApiPayload<Schema, Method, Endpoint> }
	: ParamsType & { body: ApiPayload<Schema, Method, Endpoint> }

type FunctionDefinition<
	Schema extends ApiSchema,
	Method extends MethodsFromSchema<Schema>,
	Endpoint extends EndpointStringsFromSchema<Schema>[Method],
	ParamsType,
	ReturnType,
	Adapter extends Adapters,
	Payload
	> = (args: WithBody<Schema, Method, Endpoint, ParamsType> & AdapterPayload<Payload>[Adapter]) => Promise<ReturnType | StatusResponse>

type ServerHandlerInner<Schema extends ApiSchema, Methods extends MethodsFromSchema<Schema>, Endpoints extends EndpointStringsFromSchema<Schema>, Adapter extends Adapters, Payload> = {
	[Method in Methods]: {
		[Endpoint in Endpoints[Method]]: Endpoint extends string
		? FunctionDefinition<
			Schema,
			Method,
			Endpoint,
			ApiParams<ParseSlugs<Endpoint>, ParseQuery<Endpoint>>,
			ApiResult<Schema, Method, Endpoint>,
			Adapter,
			Payload
		>
		: never
	}
}

export type ServerHandler<Schema extends ApiSchema, Adapter extends Adapters = 'none', Payload = unknown> = ServerHandlerInner<
	Schema,
	MethodsFromSchema<Schema>,
	EndpointStringsFromSchema<Schema>,
	Adapter,
	Payload
>

export type MethodHandler<Schema extends ApiSchema, Method extends MethodsFromSchema<Schema>, EndpointStrings extends EndpointStringsFromSchema<Schema>, Adapter extends Adapters = 'none', Payload = unknown> = <Endpoint extends EndpointStrings[Method]>(
	endpoint: Endpoint,
	urlSearchParams: URLSearchParams,
	body: ApiPayload<Schema, Method, Endpoint>, // TODO: define 'never' case
	payload?: AdapterPayload<Payload>[Adapter]
) => Promise<ApiResult<Schema, Method, Endpoint>>


type DoBeforeParams = { method: string, endpoint: string }

export type DoBeforeFunction = (params: DoBeforeParams) => void | Promise<void>

type DoAfterParams = { method: string, endpoint: string, duration: number }

export type DoAfterFunction = (params: DoAfterParams) => void | Promise<void>
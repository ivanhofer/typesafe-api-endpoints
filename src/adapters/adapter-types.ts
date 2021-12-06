import { AnyObject } from '../types/types'

export type Adapters = 'none' | 'SvelteKit'

export type SvelteKitPayload<Payload = unknown> = {
	locals: Payload
}

export type AdapterPayload<Payload> = {
	'none': AnyObject
	'SvelteKit': SvelteKitPayload<Payload>
}

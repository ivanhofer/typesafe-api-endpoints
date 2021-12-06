import { AnyObject } from '../types/types'

export type Adapters = 'none' | 'SvelteKit'

export type SvelteKitPayload = {
	locals: AnyObject
}

export type AdapterPayload = {
	'none': AnyObject
	'SvelteKit': SvelteKitPayload
}

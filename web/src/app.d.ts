// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

declare namespace kakao.maps {
	class LatLng {
		constructor(lat: number, lng: number);
	}

	class StaticMap {
		constructor(container: HTMLElement, options: StaticMapOptions);
	}

	interface StaticMapOptions {
		center?: LatLng;
		level?: number;
		marker?: {
			position: LatLng;
			text?: string;
		};
		mapTypeId?: string;
	}

	const MapTypeId: {
		ROADMAP: string;
		HYBRID: string;
		SATELLITE: string;
	};
}

declare global {
	interface Window {
		kakao: {
			maps: typeof kakao.maps;
		};
	}
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};

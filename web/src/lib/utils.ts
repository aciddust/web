import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { cubicOut } from "svelte/easing";
import { goto } from "$app/navigation";
import type { TransitionConfig } from "svelte/transition";
import { DEFAULT_ROUTE } from "./constants";


export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

type FlyAndScaleParams = {
	y?: number;
	x?: number;
	start?: number;
	duration?: number;
};

export const flyAndScale = (
	node: Element,
	params: FlyAndScaleParams = { y: -8, x: 0, start: 0.95, duration: 150 }
): TransitionConfig => {
	const style = getComputedStyle(node);
	const transform = style.transform === "none" ? "" : style.transform;

	const scaleConversion = (
		valueA: number,
		scaleA: [number, number],
		scaleB: [number, number]
	) => {
		const [minA, maxA] = scaleA;
		const [minB, maxB] = scaleB;

		const percentage = (valueA - minA) / (maxA - minA);
		const valueB = percentage * (maxB - minB) + minB;

		return valueB;
	};

	const styleToString = (
		style: Record<string, number | string | undefined>
	): string => {
		return Object.keys(style).reduce((str, key) => {
			if (style[key] === undefined) return str;
			return str + `${key}:${style[key]};`;
		}, "");
	};

	return {
		duration: params.duration ?? 200,
		delay: 0,
		css: (t) => {
			const y = scaleConversion(t, [0, 1], [params.y ?? 5, 0]);
			const x = scaleConversion(t, [0, 1], [params.x ?? 0, 0]);
			const scale = scaleConversion(t, [0, 1], [params.start ?? 0.95, 1]);

			return styleToString({
				transform: `${transform} translate3d(${x}px, ${y}px, 0) scale(${scale})`,
				opacity: t
			});
		},
		easing: cubicOut
	};
};

export const routeToPage = (route: string, replaceState: boolean = false) => {
  goto(`/${route}`, { replaceState })
}

export const goBack = (defaultRoute = DEFAULT_ROUTE) => {
  const ref = document.referrer;
  goto(ref.length > 0 ? ref : defaultRoute)
}

export const openNewTab = (url: string) => {
	window.open(url, "_blank");
}

export const genCode = (length: number = 6) => {
	const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	let result = "";
	for (let i = 0; i < length; i++) {
		result += charset.charAt(Math.floor(Math.random() * charset.length));
	}
	return result;
}

// 페이지 새로고침 하면서 이동
export const navigateWithRefresh = (route: string, preserveQueryParams: boolean = false) => {
  const currentUrl = new URL(window.location.href);
  const targetUrl = new URL(`${window.location.origin}/${route}`);

  // 쿼리 파라미터 유지 옵션
  if (preserveQueryParams) {
    currentUrl.searchParams.forEach((value, key) => {
      targetUrl.searchParams.append(key, value);
    });
  }

  window.location.href = targetUrl.toString();
}


// 히스토리 대체하면서 새로고침 (뒤로가기 방지)
export const replaceWithRefresh = (route: string) => {
  window.location.replace(`/${route}`);
}
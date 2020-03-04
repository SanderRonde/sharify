export namespace Util {
	const CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'.split('');
	export function randomString(length: number) {
		let string: string = '';
		for (let i = 0; i < length; i++) {
			string += CHARS[Math.round(Math.random() * (CHARS.length - 1))];
		}
		return string;
	}

	export function isDev() {
		return process.argv.indexOf('--dev') > -1;
	}

	export function wait(time: number) {
		return new Promise((resolve) => setTimeout(resolve, time));
	}

	export function flat<V>(arr: (V|V[])[]): V[] {
		const result: V[] = [];
		for (const item of arr) {
			if (Array.isArray(item)) {
				result.push(...item);
			} else {
				result.push(item);
			}
		}
		return result;
	}

	export function devLog(...args: any[]) {
		if (isDev()) {
			console.log(...args);
		}
	}

	export function pick<O, K extends keyof O>(obj: O, keys: K[]): Pick<O, K> {
		const picked: Partial<Pick<O, K>> = {};
		for (const key of keys) {
			picked[key] = obj[key];
		}
		return picked as Pick<O, K>;
	}
}
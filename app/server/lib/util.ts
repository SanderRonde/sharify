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
}
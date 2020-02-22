export namespace Util {
	const CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'.split('');
	export function randomString(length: number) {
		let string: string = '';
		for (let i = 0; i < length; i++) {
			string += CHARS[Math.round(Math.random() * CHARS.length)];
		}
		return string;
	}

	export function isDev() {
		return process.argv.indexOf('--dev');
	}

	export function wait(time: number) {
		return new Promise((resolve) => setTimeout(resolve, time));
	}
}
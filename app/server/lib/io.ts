export namespace IO {
	export interface IO {
		port: number;
	}

	function assertArgLength(minLength: number) {
		if (process.argv.length < minLength) {
			console.log('Not enough arguments');
			process.exit(1);
		}
	}

	export function get(): IO {
		const io: IO = {
			port: 1234
		};

		for (let i = 0; i < process.argv.length; i++) {
			if (process.argv[i] === '-p' || process.argv[i] === '--port') {
				assertArgLength(i + 1);
				io.port = parseInt(process.argv[i + 1]);
				i++;
			} else if (process.argv[i] === '-h' || process.argv[i] === '--help') {
				console.log('Usage:');
				console.log('');
				console.log('\t-p | --port	[port] 		The port to use');
				process.exit(0);
			}
		}

		return io;
	}
}
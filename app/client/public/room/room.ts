import { WebsocketMessages } from '../../../shared/ws';

function handleMessage(message: WebsocketMessages) {
	switch (message.type) {
		case 'join':
			// TODO: make this look nicer
			if (!message.success) return;

			const membersElement = document.getElementById('members')!;
			membersElement.innerHTML = '';
			
			message.members.forEach((member) => {
				const element = document.createElement('li');
				const memberText = `${member.name} (${member.email})`;
				element.innerText = memberText;
				membersElement.appendChild(element);

				if (member.isHost) {
					document.getElementById('hostInfo')!.innerText = memberText;
				}
			});
			break;
		case 'connect':
			// TODO: room is dead
			break;
		case 'playlistupdate':
			// TODO: update playlist
			break;
	}
}

function connectToWS() {
	const ws = new WebSocket(`ws://${location.host}${location.pathname}`);
	ws.onmessage = (message) => {
		const data = JSON.parse(message.data);
		handleMessage(data);
	}
}

connectToWS();
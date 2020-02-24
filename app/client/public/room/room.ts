import { WebsocketMessages } from "../../../shared/ws";

let lastFrame: HTMLIFrameElement|null = null;
function handleMessage(message: WebsocketMessages) {
    switch (message.type) {
        case "join":
            // TODO: make this look nicer
            if (!message.success) return;

            const membersElement = document.getElementById("members")!;
            membersElement.innerHTML = "";

            message.members.forEach((member) => {
                const element = document.createElement("li");
                const memberText = `${member.name} (${member.email})`;
                element.innerText = memberText;
                membersElement.appendChild(element);

                if (member.isHost) {
                    document.getElementById("hostInfo")!.innerText = memberText;
                }
            });
            break;
        case "connect":
            // TODO: room is dead if error=true
            break;
        case "playlistupdate":
			if (lastFrame) {
				lastFrame.remove();
			}
			// TODO: maybe removing is not needed
            const iframe = document.createElement("iframe");
            iframe.src = `https://open.spotify.com/embed/playlist/${message.playlistID}`;
            // TODO: change sizes and such
            iframe.width = "400";
            iframe.height = "500";
            iframe.frameBorder = "0";
			iframe.allow = "encrypted-media";
			
			document.body.appendChild(iframe);
            break;
    }
}

function connectToWS() {
    const ws = new WebSocket(`ws://${location.host}${location.pathname}`);
    ws.onmessage = (message) => {
        const data = JSON.parse(message.data);
        handleMessage(data);
    };
}

connectToWS();

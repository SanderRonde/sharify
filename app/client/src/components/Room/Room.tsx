import { useParams } from 'react-router-dom';
import React from "react";

export default function Room() {
	const { roomID } = useParams();
	return (
		<>
				{ `Room ${roomID}` }
		</>
	);
}

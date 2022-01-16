import { useParams } from "react-router-dom";
import Room from "./Room";
import React from "react";

export default function Wrapper() {
    const { roomID } = useParams();
    if (!roomID) {
        window.location.href = "/404";
        return <></>;
    }
    return <Room id={roomID} />;
}

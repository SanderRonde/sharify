import { CrownOutlined } from "@ant-design/icons";
import React from "react";

export default function CrownedImage({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div>
            <CrownOutlined
                style={{
                    position: "absolute",
                    marginLeft: "9px",
                    marginTop: "-10px",
                    color: "#ffc800",
                }}
            />
            {children}
        </div>
    );
}

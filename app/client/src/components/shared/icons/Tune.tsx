import React from "react";

type DimensionOptions =
    | {
          size?: number|string;
      }
    | {
          width?: number|string;
          height?: number|string;
      };

const IconTune = (
    options: DimensionOptions & {
        fill?: string;
    }
) => {
    const [width, height] = (() => {
        if ("size" in options && options.size) {
            return [options.size, options.size];
        }
        const width = (() => {
            if ("width" in options && options.width) {
                return options.width;
            }
            return 24;
        })();
        const height = (() => {
            if ("height" in options && options.height) {
                return options.height;
            }
            return 24;
        })();
        return [width, height];
    })();
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            style={{ width, height }}
        >
            <path d="M0 0h24v24H0z" fill="none" />
            <path
                fill={options.fill || "black"}
                d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z"
            />
        </svg>
    );
};

export default IconTune;

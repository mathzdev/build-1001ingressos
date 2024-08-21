import { IconProps } from '.';

export default function MinusIcon({ ...props }: IconProps) {
    return (
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <g id="tabler:minus" clipPath="url(#clip0_52_9808)">
                <path
                    id="Vector"
                    d="M5 12H19"
                    stroke="#F86565"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    id="Vector_2"
                    d="M23 12C23 5.92708 18.0729 1 12 1C5.92708 1 1 5.92708 1 12C1 18.0729 5.92708 23 12 23C18.0729 23 23 18.0729 23 12Z"
                    stroke="#F86565"
                    strokeWidth="1.875"
                    strokeMiterlimit="10"
                />
            </g>
            <defs>
                <clipPath id="clip0_52_9808">
                    <rect width="24" height="24" fill="white" />
                </clipPath>
            </defs>
        </svg>
    );
}

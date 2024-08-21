import { IconProps } from '.';

export default function LogoTKIcon({ ...props }: IconProps) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="115"
            height="75"
            viewBox="0 0 115 75"
            fill="none"
            {...props}
        >
            <rect x="20" y="62" width="75" height="13" fill="white" />
            <rect x="20" y="41" width="23" height="13" fill="white" />
            <rect x="72" y="41" width="23" height="13" fill="white" />
            <rect
                x="51"
                y="54"
                width="25"
                height="13"
                transform="rotate(-90 51 54)"
                fill="white"
            />
            <circle cx="57.5" cy="11.5" r="11.5" fill="white" />
            <circle cx="103.5" cy="29.5" r="11.5" fill="white" />
            <circle cx="11.5" cy="29.5" r="11.5" fill="white" />
        </svg>
    );
}

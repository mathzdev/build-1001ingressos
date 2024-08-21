import { IconProps } from '.';

export default function BtnNotIcon({ ...props }: IconProps) {
    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="black"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <g clipPath="url(#clip0_134_2917)">
                <path d="M15 7.5C16.3807 7.5 17.5 6.38071 17.5 5C17.5 3.61929 16.3807 2.5 15 2.5C13.6193 2.5 12.5 3.61929 12.5 5C12.5 6.38071 13.6193 7.5 15 7.5Z" />
                <path d="M15 15.8334H4.16667V5.00004H10.8333C10.8333 4.40671 10.9608 3.84421 11.185 3.33337H4.16667C3.2475 3.33337 2.5 4.08087 2.5 5.00004V15.8334C2.5 16.7525 3.2475 17.5 4.16667 17.5H15C15.9192 17.5 16.6667 16.7525 16.6667 15.8334V8.81504C16.1415 9.04666 15.5739 9.16642 15 9.16671V15.8334Z" />
            </g>
            <defs>
                <clipPath id="clip0_134_2917">
                    <rect width="20" height="20" fill="white" />
                </clipPath>
            </defs>
        </svg>
    );
}

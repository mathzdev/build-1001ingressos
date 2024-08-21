import { IconProps } from '.';

const PixIcon = ({ ...props }: IconProps) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="25"
            viewBox="0 0 16 25"
            fill="none"
            {...props}
        >
            <rect y="12" width="8" height="8" rx="4" fill="#FDBD39" />
        </svg>
    );
};

export default PixIcon;

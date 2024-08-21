import { IconProps } from '.';

const ArrowIcon = ({ ...props }: IconProps) => {
    return (
        <svg
            width="13"
            height="24"
            viewBox="0 0 13 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <path
                id="Vector"
                d="M11.8571 22.7143L1 11.8571L11.8571 1"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};

export default ArrowIcon;

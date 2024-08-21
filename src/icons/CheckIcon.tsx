import { IconProps } from '.';

const CheckIcon = ({ ...props }: IconProps) => {
    return (
        <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <g id="material-symbols:check">
                <path
                    id="Vector"
                    d="M4.77499 9.00005L1.92499 6.15005L2.63749 5.43755L4.77499 7.57505L9.36249 2.98755L10.075 3.70005L4.77499 9.00005Z"
                    fill="white"
                />
            </g>
        </svg>
    );
};

export default CheckIcon;

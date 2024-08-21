import { IconProps } from '.';

export default function BtnOutIcon({ ...props }: IconProps) {
    return (
        <svg
            width="25"
            height="26"
            viewBox="0 0 25 26"
            fill="none"
            stroke="black"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <path
                d="M14.8438 16.9062V18.8594C14.8438 19.3774 14.638 19.8742 14.2717 20.2404C13.9054 20.6067 13.4086 20.8125 12.8906 20.8125H5.07812C4.56012 20.8125 4.06334 20.6067 3.69706 20.2404C3.33078 19.8742 3.125 19.3774 3.125 18.8594V7.14062C3.125 6.62262 3.33078 6.12584 3.69706 5.75956C4.06334 5.39328 4.56012 5.1875 5.07812 5.1875H12.5C13.5786 5.1875 14.8438 6.06201 14.8438 7.14062V9.09375M17.9688 16.9062L21.875 13L17.9688 9.09375M8.59375 13H21.0938"
                strokeWidth="1.5625"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

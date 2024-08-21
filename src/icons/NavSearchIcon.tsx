import { IconProps } from '.';

const NavSearchIcon = ({ ...props }: IconProps) => {
    return (
        <svg
            width="35"
            height="35"
            viewBox="0 0 35 35"
            fill="black"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <path d="M31.3988 29.8511L24.5533 23.007C26.5374 20.6249 27.5267 17.5697 27.3156 14.4767C27.1044 11.3838 25.709 8.49135 23.4195 6.40108C21.1301 4.31081 18.1229 3.18365 15.0236 3.25409C11.9242 3.32453 8.97138 4.58713 6.77926 6.77926C4.58713 8.97138 3.32453 11.9242 3.25409 15.0236C3.18365 18.1229 4.31081 21.1301 6.40108 23.4195C8.49135 25.709 11.3838 27.1044 14.4767 27.3156C17.5697 27.5267 20.6249 26.5374 23.007 24.5533L29.8511 31.3988C29.9527 31.5004 30.0734 31.581 30.2062 31.636C30.3389 31.691 30.4812 31.7193 30.6249 31.7193C30.7687 31.7193 30.911 31.691 31.0437 31.636C31.1765 31.581 31.2972 31.5004 31.3988 31.3988C31.5004 31.2972 31.581 31.1765 31.636 31.0437C31.691 30.911 31.7193 30.7687 31.7193 30.6249C31.7193 30.4812 31.691 30.3389 31.636 30.2062C31.581 30.0734 31.5004 29.9527 31.3988 29.8511ZM5.4687 15.3124C5.4687 13.3655 6.04602 11.4623 7.12767 9.84355C8.20931 8.22475 9.7467 6.96306 11.5454 6.21801C13.3441 5.47296 15.3234 5.27802 17.2329 5.65784C19.1424 6.03766 20.8964 6.97519 22.273 8.35186C23.6497 9.72854 24.5872 11.4825 24.9671 13.392C25.3469 15.3015 25.1519 17.2808 24.4069 19.0795C23.6618 20.8782 22.4001 22.4156 20.7813 23.4972C19.1625 24.5789 17.2594 25.1562 15.3124 25.1562C12.7026 25.1533 10.2005 24.1153 8.35506 22.2698C6.50963 20.4244 5.47159 17.9223 5.4687 15.3124Z" />
        </svg>
    );
};

export default NavSearchIcon;

import { ReactNode } from "react";

import styles from "./HeadingUnderline.module.css";

interface HeadingUnderlineProps {
  children: ReactNode;
}

const HeadingUnderline = ({ children }: HeadingUnderlineProps) => (
  <span className={styles.underline}>
    {children}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 352 16"
      fill="none"
      preserveAspectRatio="none"
    >
      <path
        fill="url(#paint0_angular_57_743)"
        fillRule="evenodd"
        d="M350.974 15.007C216.288-1.307 61.29 8.211.669 15.01L0 9.048C60.879 2.22 216.381-7.34 351.695 9.05l-.721 5.956Z"
        clipRule="evenodd"
      />
      <defs>
        <linearGradient
          id="paint0_angular_57_743"
          x1={172}
          x2={180.5}
          y1={32.5}
          y2={-24.5}
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#BB8DEB" />
          <stop offset={0.291} stopColor="#F8DFD8" />
          <stop offset={0.632} stopColor="#FFA6EA" />
          <stop offset={0.881} stopColor="#45DFF8" />
        </linearGradient>
      </defs>
    </svg>
  </span>
);

export { HeadingUnderline };

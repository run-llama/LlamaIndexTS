import clsx from "clsx";

import {
  FaDiscord,
  FaGithub,
  FaLinkedin,
  FaPython,
  FaYoutube,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { SiTypescript } from "react-icons/si";

import { Text } from "@/components/website/Text";

import styles from "./Socials.module.css";

interface SocialsProps {
  className?: string;
  showDescription?: boolean;
  theme?: "light" | "dark";
}

const Socials = ({
  theme = "light",
  showDescription = false,
  className,
}: SocialsProps) => (
  <>
    {!showDescription && <IconsList theme={theme} className={className} />}
    {showDescription && (
      <IconsWithDescription theme={theme} className={className} />
    )}
  </>
);

const IconsList = ({ theme, className }: SocialsProps) => (
  <ul
    className={clsx(
      styles.socials,
      styles[`socials-theme-${theme}`],
      className,
    )}
  >
    <li>
      <a href="https://github.com/run-llama/llama_index">
        <FaGithub />
      </a>
    </li>
    <li>
      <a href="https://discord.com/invite/eN6D2HQ4aX">
        <FaDiscord />
      </a>
    </li>
    <li>
      <a href="https://twitter.com/llama_index">
        <FaXTwitter />
      </a>
    </li>
    <li>
      <a href="https://www.linkedin.com/company/91154103/">
        <FaLinkedin />
      </a>
    </li>
    <li>
      <a href="https://www.youtube.com/@LlamaIndex">
        <FaYoutube />
      </a>
    </li>
  </ul>
);

const IconsWithDescription = ({ theme, className }: SocialsProps) => (
  <ul
    className={clsx(
      styles.socials,
      styles.socialsWithDescription,
      styles[`socials-theme-${theme}`],
      className,
    )}
  >
    <li>
      <div className={styles.icons}>
        <a href="https://github.com/run-llama/llama_index">
          <FaPython />
        </a>
        <a href="https://github.com/run-llama/LlamaIndexTS">
          <SiTypescript />
        </a>
      </div>
      <Text>File issues and contribute patches</Text>
    </li>
    <li>
      <div className={styles.icons}>
        <a href="https://twitter.com/llama_index">
          <FaXTwitter />
        </a>
        <a href="https://www.linkedin.com/company/91154103/">
          <FaLinkedin />
        </a>
      </div>
      <Text>Follow us on social media for the latest updates</Text>
    </li>
    <li>
      <a href="https://discord.com/invite/eN6D2HQ4aX">
        <FaDiscord />
      </a>
      <Text>Get help from LlamaIndex and your peers</Text>
    </li>

    <li>
      <a href="https://www.youtube.com/@LlamaIndex">
        <FaYoutube />
      </a>
      <Text>Dive in to our tutorials and webinars</Text>
    </li>
  </ul>
);

export { Socials };

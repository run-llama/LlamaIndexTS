import Image from "next/image";

import { Text } from "@/components/website/Text";

import { Socials } from "@/components/website/Socials";
import styles from "./Footer.module.css";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.navContainer}>
        <div className={styles.logoContainer}>
          <Image
            src="/llamaindex.svg"
            alt="LlamaIndex"
            width={213}
            height={42}
          />
          <div className={styles.socialContainer}>
            <Socials />
          </div>
        </div>
        <div className={styles.nav}>
          <div>
            <Text size={20} weight={600} as="h3" className={styles.navHeader}>
              <a href="https://llamaindex.ai">LlamaIndex</a>
            </Text>
            <ul>
              <li>
                <a href="https://llamaindex.ai/blog">
                  <Text as="span">Blog</Text>
                </a>
              </li>
              <li>
                <a href="https://llamaindex.ai/partners">
                  <Text as="span">Partners</Text>
                </a>
              </li>
              <li>
                <a href="https://llamaindex.ai/careers">
                  <Text as="span">Careers</Text>
                </a>
              </li>
              <li>
                <a href="https://llamaindex.ai/contact">
                  <Text as="span">Contact</Text>
                </a>
              </li>
              <li>
                <a href="https://llamaindex.statuspage.io" target="_blank">
                  <Text as="span">Status</Text>
                </a>
              </li>
            </ul>
          </div>
          <div>
            <Text size={20} weight={600} as="h3" className={styles.navHeader}>
              <a href="https://llamaindex.ai/enterprise">Enterprise</a>
            </Text>
            <ul>
              <li>
                <a
                  href="https://cloud.llamaindex.ai"
                  data-tracking-variant="link"
                  data-tracking-section="footer"
                >
                  <Text as="span">LlamaCloud</Text>
                </a>
              </li>
              <li>
                <a
                  href="https://cloud.llamaindex.ai/parse"
                  data-tracking-variant="link"
                  data-tracking-section="footer"
                >
                  <Text as="span">LlamaParse</Text>
                </a>
              </li>
              <li>
                <a
                  href="https://llamaindex.ai/llamacloud-sharepoint-data-loading-for-generative-ai"
                  data-tracking-variant="link"
                  data-tracking-section="footer"
                >
                  <Text as="span">SharePoint</Text>
                </a>
              </li>
            </ul>
          </div>
          <div>
            <Text size={20} weight={600} as="h3" className={styles.navHeader}>
              <a href="https://llamaindex.ai/open-source">Open Source</a>
            </Text>
            <ul>
              <li>
                <a href="https://pypi.org/project/llama-index/">
                  <Text as="span">Python package</Text>
                </a>
              </li>
              <li>
                <a href="https://docs.llamaindex.ai">
                  <Text as="span">Python docs</Text>
                </a>
              </li>
              <li>
                <a href="https://www.npmjs.com/package/llamaindex">
                  <Text as="span">TypeScript package</Text>
                </a>
              </li>
              <li>
                <a href="https://ts.llamaindex.ai">
                  <Text as="span">TypeScript docs</Text>
                </a>
              </li>
              <li>
                <a href="https://llamahub.ai">
                  <Text as="span">LlamaHub</Text>
                </a>
              </li>
              <li>
                <a href="https://github.com/run-llama">
                  <Text as="span">GitHub</Text>
                </a>
              </li>
            </ul>
          </div>
          <div>
            <Text size={20} weight={600} as="h3" className={styles.navHeader}>
              <a href="https://llamaindex.ai/community">Community</a>
            </Text>
            <ul>
              <li>
                <a href="https://llamaindex.ai/community#newsletter">
                  <Text as="span">Newsletter</Text>
                </a>
              </li>
              <li>
                <a href="https://discord.com/invite/eN6D2HQ4aX">
                  <Text as="span">Discord</Text>
                </a>
              </li>
              <li>
                <a href="https://twitter.com/llama_index">
                  <Text as="span">Twitter/X</Text>
                </a>
              </li>
              <li>
                <a href="https://www.linkedin.com/company/91154103/">
                  <Text as="span">LinkedIn</Text>
                </a>
              </li>
              <li>
                <a href="https://www.youtube.com/@LlamaIndex">
                  <Text as="span">YouTube</Text>
                </a>
              </li>
            </ul>
          </div>
          <div>
            <Text size={20} weight={600} as="h3" className={styles.navHeader}>
              Starter projects
            </Text>
            <ul>
              <li>
                <a href="https://www.npmjs.com/package/create-llama">
                  <Text as="span">create-llama</Text>
                </a>
              </li>
              <li>
                <a href="https://secinsights.ai">
                  <Text as="span">SEC Insights</Text>
                </a>
              </li>
              <li>
                <a href="https://chat.llamaindex.ai/">
                  <Text as="span">Chat LlamaIndex</Text>
                </a>
              </li>
              <li>
                <a href="https://github.com/run-llama/llamabot">
                  <Text as="span">LlamaBot</Text>
                </a>
              </li>
              <li>
                <a href="https://docs.llamaindex.ai/en/stable/use_cases/q_and_a/rag_cli.html">
                  <Text as="span">RAG CLI</Text>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className={styles.copyrightContainer}>
        <Text className={styles.copyright} size={14}>
          &copy; {new Date().getFullYear()} LlamaIndex
        </Text>
        <div className={styles.legalNav}>
          <Text className={styles.copyright} size={14}>
            <a href="https://llamaindex.ai/files/privacy-notice.pdf">
              Privacy Notice
            </a>
          </Text>
          <Text className={styles.copyright} size={14}>
            <a href="https://llamaindex.ai/files/terms-of-service.pdf">
              Terms of Service
            </a>
          </Text>
        </div>
      </div>
    </footer>
  );
};

export { Footer };

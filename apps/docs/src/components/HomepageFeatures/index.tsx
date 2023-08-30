import clsx from "clsx";
import React from "react";
import styles from "./styles.module.css";

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<"svg">>;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: "Data Driven",
    Svg: require("@site/static/img/undraw_docusaurus_mountain.svg").default,
    description: <>LlamaIndex.TS is all about using your data with LLMs.</>,
  },
  {
    title: "Typescript Native",
    Svg: require("@site/static/img/undraw_docusaurus_tree.svg").default,
    description: <>We ❤️ Typescript, and so do our users.</>,
  },
  {
    title: "Built by the Community",
    Svg: require("@site/static/img/undraw_docusaurus_react.svg").default,
    description: (
      <>
        LlamaIndex.TS is a community project, and we welcome your contributions!
      </>
    ),
  },
];

function Feature({ title, Svg, description }: FeatureItem) {
  return (
    <div className={clsx("col col--4")}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}

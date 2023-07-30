module.exports = {
  extends: ["next", "turbo", "prettier"],
  rules: {
    "@next/next/no-html-link-for-pages": "off",
    "turbo/no-undeclared-env-vars": [
      "error",
      {
        allowList: [
          "OPENAI_API_KEY",
          "REPLICATE_API_TOKEN",
          "ANTHROPIC_API_KEY",
          "DEBUG",
          "no_proxy",
          "NO_PROXY",
        ],
      },
    ],
  },
  // NOTE I think because we've temporarily removed all of the NextJS stuff
  // from the turborepo not having next in the devDeps causes an error on only
  // clean clones of the repo
  // Not sure if this is a missing dependency in the package.json or just my not
  // understanding how turborepo is supposed to work.
  // Anyways, planning to add back a Next.JS example soon
  parserOptions: {
    babelOptions: {
      presets: [require.resolve("next/babel")],
    },
  },
};

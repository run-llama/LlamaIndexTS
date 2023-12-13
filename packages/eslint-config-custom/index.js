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
          "ASSEMBLYAI_API_KEY",

          "ASTRA_DB_ID",
          "ASTRA_DB_REGION",
          "ASTRA_DB_APPLICATION_TOKEN",
          "ASTRA_DB_NAMESPACE",

          "AZURE_OPENAI_KEY",
          "AZURE_OPENAI_ENDPOINT",
          "AZURE_OPENAI_API_VERSION",
          "AZURE_OPENAI_DEPLOYMENT",

          "MILVUS_ADDRESS",
          "MILVUS_SSL",
          "MILVUS_USERNAME",
          "MILVUS_PASSWORD",

          "OPENAI_API_BASE",
          "OPENAI_API_VERSION",
          "OPENAI_API_TYPE",
          "OPENAI_API_ORGANIZATION",

          "PINECONE_API_KEY",
          "PINECONE_ENVIRONMENT",
          "PINECONE_PROJECT_ID",
          "PINECONE_INDEX_NAME",

          "AZURE_OPENAI_API_KEY",
          "AZURE_OPENAI_API_INSTANCE_NAME",
          "AZURE_OPENAI_API_DEPLOYMENT_NAME",

          "DEBUG",
          "no_proxy",
          "NO_PROXY",

          "NOTION_TOKEN",
          "MONGODB_URI",

          "https_proxy",
          "npm_config_user_agent",
          "NEXT_PUBLIC_CHAT_API",
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

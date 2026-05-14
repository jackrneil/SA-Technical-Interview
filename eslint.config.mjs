import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  ...nextVitals,
  {
    ignores: ["src/app/.well-known/**", ".next/**"],
  },
];

export default eslintConfig;

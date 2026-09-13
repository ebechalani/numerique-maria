import coreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

/** Configuration ESLint « plate » (ESLint 9 / Next.js 16). */
const eslintConfig = [
  {
    ignores: [".next/**", "node_modules/**", "next-env.d.ts"],
  },
  ...coreWebVitals,
  ...nextTypeScript,
];

export default eslintConfig;

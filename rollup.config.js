import resolve from "@rollup/plugin-node-resolve"
import typescript from "@rollup/plugin-typescript"

import { version } from "./package.json"
const year = new Date().getFullYear()
const banner = `/*\nTurbo ${version}\nCopyright © ${year} Basecamp, LLC\n */`

export default [
  {
    input: "src/index.ts",
    output: [
      {
        name: "Turbo",
        file: "dist/turbo.es5-umd.js",
        format: "umd",
        sourcemap: true,
        banner
      }
    ],
    plugins: [
      resolve(),
      typescript({ target: "es5" })
    ],
    watch: {
      include: "src/**"
    }
  },

  {
    input: "src/index.ts",
    output: [
      {
        name: "Turbo",
        file: "dist/turbo.es2017-umd.js",
        format: "umd",
        sourcemap: true,
        banner
      },
      {
        file: "dist/turbo.es2017-esm.js",
        format: "es",
        sourcemap: true,
        banner
      }
    ],
    plugins: [
      resolve(),
      typescript()
    ],
    watch: {
      include: "src/**"
    }
  },

  {
    input: "src/tests/functional/index.ts",
    output: [
      {
        file: "dist/tests/functional.js",
        format: "cjs",
        sourcemap: true
      }
    ],
    plugins: [
      resolve(),
      typescript()
    ],
    external: [
      "http",
      "intern"
    ],
    watch: {
      include: "src/tests/**"
    }
  },

  {
    input: "src/tests/unit/index.ts",
    output: [
      {
        file: "dist/tests/unit.js",
        format: "iife",
        sourcemap: true
      }
    ],
    plugins: [
      resolve(),
      typescript()
    ],
    external: [
      "intern"
    ],
    watch: {
      include: "src/tests/**"
    }
  }
]
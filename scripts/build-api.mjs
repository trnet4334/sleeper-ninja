import { build } from "esbuild";
import { glob } from "glob";

const entryPoints = await glob("api/**/*.ts", {
  ignore: ["api/_shared/**", "api/**/_*.ts"],
});

await build({
  entryPoints,
  bundle: true,
  platform: "node",
  target: "node20",
  format: "cjs",
  outbase: ".",
  outdir: ".",
  outExtension: { ".js": ".cjs" },
  allowOverwrite: true,
  external: ["@supabase/supabase-js"],
});

console.log(`Bundled ${entryPoints.length} API functions.`);

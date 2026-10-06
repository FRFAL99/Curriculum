// Controlla che il JavaScript del sito resti leggero (piano v3, Fase 28).
// Gira dopo `npm run build`, in CI: misura i .js di dist/assets compressi
// con gzip, come li scarica il telefono, e fallisce sopra il tetto.
// Il tetto si alza solo di proposito, scrivendo il perché nel devlog.
import fs from "node:fs";
import path from "node:path";
import { gzipSync } from "node:zlib";

const BUDGET_KB = 120;
const dir = path.join(process.cwd(), "dist", "assets");

if (!fs.existsSync(dir)) {
  console.error("dist/assets non esiste: lancia prima `npm run build`.");
  process.exit(1);
}

const files = fs.readdirSync(dir).filter((f) => f.endsWith(".js"));
let total = 0;
for (const file of files) {
  const size = gzipSync(fs.readFileSync(path.join(dir, file))).length;
  total += size;
  console.log(`${(size / 1024).toFixed(1).padStart(7)} KB gzip  ${file}`);
}

const totalKb = total / 1024;
console.log(`${totalKb.toFixed(1).padStart(7)} KB gzip  totale (tetto ${BUDGET_KB} KB)`);
if (totalKb > BUDGET_KB) {
  console.error(`Il JavaScript supera il tetto di ${BUDGET_KB} KB gzip.`);
  process.exit(1);
}

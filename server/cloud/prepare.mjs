import { readFileSync, writeFileSync } from 'node:fs';

// Encode exact reviewed source text; the builder hashes these bytes as Node does.
const raw = readFileSync(new URL('../../docs/official/demo-event-akmu.json', import.meta.url), 'utf8');
const evidence = readFileSync(new URL('../data/akmu-price-evidence.json', import.meta.url), 'utf8');
const output = `import { buildCatalog } from '../src/catalog-builder.ts';\nexport const catalog = buildCatalog(${JSON.stringify(raw)}, ${JSON.stringify(evidence)});\n`;
writeFileSync(new URL('./catalog.generated.ts', import.meta.url), output);

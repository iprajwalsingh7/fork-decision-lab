import {readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
for(const file of ['dist/app.mjs','dist/core.mjs','scripts/serve.mjs'])execFileSync(process.execPath,['--check',file],{stdio:'inherit'});
for(const file of ['dist/index.html','dist/styles.css','dist/icon.svg'])if(!(await readFile(file,'utf8')).trim())throw new Error(`Empty asset: ${file}`);
console.log('Static assets and JavaScript syntax verified. Deploy directory: dist/');

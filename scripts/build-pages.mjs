import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
const repo=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const source=path.join(repo,'marketing-console-prototype');
const output=path.join(repo,'dist','pages');
const files=['index.html','app.js','state.js','format.js','language.js','styles.css','keyboard-styles.css','assets/keyboard-graphite.svg','assets/keyboard-cloud.svg','assets/keyboard-moss.svg'];
const allowed=new Set([...files,'.nojekyll','build-info.json']);
function inventory(dir){if(!fs.existsSync(dir))return [];return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{if(e.isSymbolicLink())throw Error('Deployment cannot contain symbolic links');const p=path.join(dir,e.name);return e.isDirectory()?inventory(p):[path.relative(output,p).replaceAll('\\','/')];});}
for(const file of inventory(output))if(!allowed.has(file))throw Error('Unexpected file in deployment output: '+file);
const sha=process.env.BUILD_SHA||execFileSync('git',['rev-parse','HEAD'],{cwd:repo,encoding:'utf8'}).trim();
if(!/^[0-9a-f]{40}$/.test(sha))throw Error('Invalid build commit');
const hashes={};
for(const file of files){
  const full=path.join(source,file);if(fs.lstatSync(full).isSymbolicLink())throw Error('Source cannot be a symbolic link');
  const bytes=fs.readFileSync(full);if(/[\u2e80-\u9fff\uf900-\ufaff\uff01-\uff60]/.test(bytes.toString('utf8')))throw Error('Non-English UI text in '+file);
  const target=path.join(output,file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,bytes);
  hashes[file]=crypto.createHash('sha256').update(bytes).digest('hex');
}
fs.writeFileSync(path.join(output,'.nojekyll'),'');
fs.writeFileSync(path.join(output,'build-info.json'),JSON.stringify({commit:sha,files:hashes},null,2)+'\n');
console.log(`Pages artifact: ${files.length} frontend files plus .nojekyll and build-info.json; no backend, docs, tests or credentials.`);

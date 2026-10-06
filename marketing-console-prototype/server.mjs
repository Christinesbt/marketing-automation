import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 4173);
const files = new Set(['index.html','app.js','state.js','format.js','language.js','styles.css','keyboard-styles.css','assets/keyboard-graphite.svg','assets/keyboard-cloud.svg','assets/keyboard-moss.svg']);
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml'};
const server = http.createServer(async (req,res) => {
  const filename = new URL(req.url, 'http://localhost').pathname.replace(/^\//,'') || 'index.html';
  if (!['GET','HEAD'].includes(req.method) || !files.has(filename)) {res.writeHead(404);res.end('Not found');return;}
  try {
    const body=await readFile(path.join(root,filename));
    res.writeHead(200,{'Content-Type':types[path.extname(filename)],'Cache-Control':'no-store','Content-Security-Policy':"default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'none'; font-src 'self'; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'none'"});
    res.end(req.method==='HEAD'?undefined:body);
  } catch {res.writeHead(500);res.end('Unable to load local file');}
});
server.on('error',e=>{console.error(e.code==='EADDRINUSE'?`Port ${port} is occupied. Use $env:PORT=4174; npm start`:e.message);process.exit(1);});
server.listen(port,'127.0.0.1',()=>console.log(`Relay local prototype: http://127.0.0.1:${port}\nFictional data only. No external connections. Ctrl+C to stop.`));

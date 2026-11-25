// Production build: minify + obfuscate the game scripts into dist/ (deployed by Vercel via vercel.json).
// The readable source stays in the repo; visitors only ever receive the protected bundle.
// NOTE: nothing that runs in a browser can be made copy-proof. This only raises the effort for casual copying.
const fs = require('fs'), path = require('path');
const { minify } = require('terser');
const JSO = require('javascript-obfuscator');
const root = path.join(__dirname, '..'), out = path.join(root, 'dist');
fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(path.join(out, 'js'), { recursive: true });
const copy = (a, b) => fs.cpSync(path.join(root, a), path.join(out, b || a), { recursive: true });
['index.html', 'style.css', 'manifest.webmanifest', 'icon.svg'].forEach(f => copy(f));
if (fs.existsSync(path.join(root, 'audio'))) copy('audio');
(async () => {
  // single bundle, load order matters: guard -> lines -> art -> game
  const order = ['guard.js', 'lines.js', 'art.js', 'game.js'];
  let src = order.map(f => fs.readFileSync(path.join(root, 'js', f), 'utf8')).join('\n;\n');
  const m = await minify(src, { compress: { passes: 2 }, mangle: true, format: { comments: false } });
  const ob = JSO.obfuscate(m.code, {
    compact: true, controlFlowFlattening: false, deadCodeInjection: false, stringArray: true, stringArrayThreshold: .6,
    stringArrayEncoding: ['base64'], rotateStringArray: true, renameGlobals: false, identifierNamesGenerator: 'hexadecimal',
    selfDefending: false, debugProtection: false, disableConsoleOutput: true, unicodeEscapeSequence: false, simplify: true
  });
  fs.writeFileSync(path.join(out, 'js', 'app.js'), ob.getObfuscatedCode());
  let html = fs.readFileSync(path.join(out, 'index.html'), 'utf8');
  html = html.replace(/<script src="js\/(guard|lines|art|game)\.js"><\/script>\s*/g, '').replace('</body>', '<script src="js/app.js"></script>\n</body>');
  fs.writeFileSync(path.join(out, 'index.html'), html);
  console.log('built dist/ —', (fs.statSync(path.join(out, 'js/app.js')).size / 1024).toFixed(0) + ' KB bundle');
})();

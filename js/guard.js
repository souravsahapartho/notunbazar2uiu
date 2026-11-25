/* Light anti-copy guard: refuses to run on unofficial hosts or inside someone else's frame.
   (A determined person can bypass any client-side check; the build step + private repo + licence do the rest.) */
(function () {
  var OK = ['notunbazar2uiu.vercel.app', 'localhost', '127.0.0.1', '[::1]'];
  var h = location.hostname, ok = OK.indexOf(h) >= 0 || /\.vercel\.app$/.test(h) && /^notunbazar2uiu/.test(h) || h === '' /* file:// */;
  if (window.top !== window.self) { try { window.top.location = window.self.location; } catch (e) { ok = false; } }
  if (!ok) {
    document.documentElement.innerHTML = '<body style="font-family:sans-serif;padding:24px;background:#fef3c7"><h2>এটি অফিসিয়াল কপি নয়</h2><p>অফিসিয়াল গেম: <a href="https://notunbazar2uiu.vercel.app">notunbazar2uiu.vercel.app</a></p></body>';
    throw new Error('unofficial host');
  }
})();

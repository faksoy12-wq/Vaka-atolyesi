(() => {
  const key = 'vaka-appearance-v1';
  const system = matchMedia('(prefers-color-scheme: dark)');
  const palettes = ['classic', 'ink', 'plum', 'clay'];
  const modes = ['light', 'dark', 'system'];
  const root = document.documentElement;
  let saved;
  try { saved = JSON.parse(localStorage.getItem(key)); } catch {}
  let palette = palettes.includes(saved?.palette) ? saved.palette : 'classic';
  let mode = modes.includes(saved?.mode) ? saved.mode : 'light';

  function apply() {
    const tone = mode === 'system' ? (system.matches ? 'dark' : 'light') : mode;
    root.dataset.palette = palette;
    root.dataset.tone = tone;
    root.toggleAttribute('data-custom', palette !== 'classic' || tone !== 'light');
    const color = getComputedStyle(root).getPropertyValue(tone === 'dark' ? '--va-bg' : '--va-accent').trim();
    if (color) document.querySelector('meta[name="theme-color"]').content = color;
  }
  apply();
  system.addEventListener('change', apply);
  document.addEventListener('DOMContentLoaded', () => {
    const modeInput = document.getElementById('appearance-mode');
    const paletteInput = document.getElementById('appearance-palette');
    modeInput.value = mode;
    paletteInput.value = palette;
    function change() {
      mode = modeInput.value;
      palette = paletteInput.value;
      apply();
      try { localStorage.setItem(key, JSON.stringify({mode, palette})); } catch {}
    }
    modeInput.addEventListener('change', change);
    paletteInput.addEventListener('change', change);
  });
})();

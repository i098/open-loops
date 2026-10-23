const architecture = document.getElementById('architecture-view');
let rendering = false;
async function renderArchitecture() {
  if (!architecture.open || architecture.dataset.rendered || rendering) return;
  rendering = true;
  const status = document.getElementById('architecture-status');
  status.textContent = 'Rendering proposed architecture…';
  const nodes = [...architecture.querySelectorAll('.architecture-section')].map((section) => {
    const pre = section.querySelector('.architecture-figure');
    pre.textContent = section.querySelector('.architecture-source').textContent.trim();
    return pre;
  });
  try {
    const { default: mermaid } =
      await import('https://cdn.jsdelivr.net/npm/mermaid@11.15.0/dist/mermaid.esm.min.mjs');
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      theme: 'base',
      themeVariables: {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '14px',
        primaryColor: '#f5f3f8',
        primaryTextColor: '#292f2c',
        primaryBorderColor: '#8b7aab',
        lineColor: '#69706b',
        secondaryColor: '#edf1e9',
        tertiaryColor: '#f7f7f2',
      },
      flowchart: { htmlLabels: false, useMaxWidth: true },
      sequence: { wrap: true, useMaxWidth: true },
    });
    await mermaid.run({ nodes });
    architecture.dataset.rendered = 'true';
    status.textContent =
      'Four proposed diagrams. Scroll horizontally where needed; no integration is implemented.';
  } catch (error) {
    status.textContent = 'Diagram rendering unavailable. The Mermaid source remains visible below.';
  } finally {
    rendering = false;
  }
}
architecture.addEventListener('toggle', renderArchitecture);
if (architecture.open) renderArchitecture();

addEventListener('mousemove', e => {
	document.documentElement.style = `--x: ${e.clientX}px; --y: ${e.clientY}px; `
})
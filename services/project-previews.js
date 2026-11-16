function initProjectPreviews(projectPreview) {
    const tabs = projectPreview.querySelectorAll('.vibe-tab');
    let activeTab = projectPreview.querySelector('.vibe-tab.active');
    const frameTemplate = projectPreview.querySelector('#preview-frame');
    const previewStage = projectPreview.querySelector('.preview-stage');
    const previewScreen = projectPreview.querySelector('.preview-screen');
    const usePreview = projectPreview.querySelector('.preview-interact');
    const stopPreview = projectPreview.querySelector('.preview-stop');
    const previewWidth = 1280;
    const previewHeight = 800;
    let previewFrame;
    const iframePool = new Map();
    frameTemplate.remove();

    function getOrCreateIframe(url) {
        if (!iframePool.has(url)) {
            const frame = frameTemplate.cloneNode();
            frame.removeAttribute('id');
            frame.src = url;
            previewScreen.append(frame);
            iframePool.set(url, frame);
        }
        return iframePool.get(url);
    }

    function sizePreview() {
        if (!previewFrame) return;
        const scale = Math.min(1, previewStage.clientWidth / previewWidth);
        previewScreen.style.width = `${previewWidth * scale}px`;
        previewScreen.style.height = `${previewHeight * scale}px`;
        previewFrame.style.width = `${previewWidth}px`;
        previewFrame.style.height = `${previewHeight}px`;
        previewFrame.style.transform = `scale(${scale})`;
    }

    function setPreviewInteraction(interactive) {
        previewFrame.tabIndex = interactive ? 0 : -1;
        previewScreen.classList.toggle('is-interactive', interactive);
        usePreview.hidden = interactive;
        stopPreview.hidden = !interactive;
    }

    function updatePreview() {
        const url = new URL(activeTab.dataset.url);
        if (previewFrame) {
            previewFrame.hidden = true;
            previewFrame.tabIndex = -1;
        }
        previewFrame = getOrCreateIframe(url.href);
        previewFrame.hidden = false;
        projectPreview.querySelector('#preview-address').textContent = url.hostname;
        projectPreview.querySelector('#preview-link').href = url.href;
        projectPreview.querySelector('#preview-description').textContent = activeTab.dataset.desc;
        previewFrame.title = `${activeTab.dataset.title} preview`;
        setPreviewInteraction(false);
        sizePreview();
    }

    for (const tab of tabs) {
        tab.addEventListener('click', () => {
            if (tab === activeTab) return;
            activeTab.classList.remove('active');
            activeTab.setAttribute('aria-pressed', 'false');
            activeTab = tab;
            tab.classList.add('active');
            tab.setAttribute('aria-pressed', 'true');
            updatePreview();
        });
    }

    usePreview.addEventListener('click', () => {
        setPreviewInteraction(true);
        previewFrame.focus();
    });
    stopPreview.addEventListener('click', () => {
        setPreviewInteraction(false);
        usePreview.focus();
    });

    if ('ResizeObserver' in window) {
        new ResizeObserver(sizePreview).observe(previewStage);
    } else {
        window.addEventListener('resize', sizePreview);
    }

    updatePreview();
}

initProjectPreviews(document.querySelector('#project-preview'));

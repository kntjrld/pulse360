
(function () {
    const preloader = document.getElementById('preloader');
    function hidePreloader() {
        if (!preloader) return;
        preloader.classList.add('hidden');
        setTimeout(() => { try { preloader.remove(); } catch (e) { } }, 500);
    }
    if (document.readyState === 'complete') hidePreloader();
    else window.addEventListener('load', hidePreloader);
    setTimeout(hidePreloader, 6000);
})();
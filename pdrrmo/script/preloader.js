
(function () {
    // Check if user has seen onboarding
    const hasSeenOnboarding = localStorage.getItem('onboardingCompleted');
    if (!hasSeenOnboarding && window.location.pathname.includes('home.html')) {
        // Redirect to onboarding page
        window.location.href = './onboarding.html';
        return;
    }

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
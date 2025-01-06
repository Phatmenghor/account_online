function showLoading() {
    var loadingIndicatorOverlay = document.createElement('div');
    loadingIndicatorOverlay.classList.add('loading-indicator-overlay');

    var loadingIndicator = document.createElement('div');
    loadingIndicator.classList.add('loading-indicator');

    var loader = document.createElement('div');
    loader.classList.add('loader');

    // var loadingText = document.createElement('div');
    // loadingText.classList.add('loading-text');
    // loadingText.innerText = 'Loading...'; // Add your loading text here

    loadingIndicator.appendChild(loader);
    // loadingIndicator.appendChild(loadingText);
    loadingIndicatorOverlay.appendChild(loadingIndicator);
    document.body.appendChild(loadingIndicatorOverlay);

    return true;
}

function hideLoading() {
    var loadingIndicatorOverlay = document.querySelector('.loading-indicator-overlay');
    if (loadingIndicatorOverlay) {
        loadingIndicatorOverlay.remove();
    }
}
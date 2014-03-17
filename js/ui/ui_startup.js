window.addEventListener("load", function(event) {
    window.removeEventListener(this);
    btg.eventManager.fireEvent('startup');
});

btg.eventManager.addListener('level.load', function() {
    console.log('ui.html: level.load');
    if(!UI.getDom("#leftTop")) {
        btg.canvas = UI.getDom("#canvas");
        UI.init(true);
        UI.loading(UI.initMainScene, ui_resources.mainScene);
        console.log('init');
    }
});

btg.eventManager.addListener('socket.connected', function() {
    loading.hide();
});

btg.eventManager.addListener('socket.loading', function() {
    loading.show();
});

btg.eventManager.addListener('socket.reconnecting', function() {
    loading.show();
});

window.addEventListener('touchmove', function(e) {
    e.preventDefault();
    e.stopPropagation();
    return false;
});

window.addEventListener('touchstart', function(e) {
    e.preventDefault();
    e.stopPropagation();
    return false;
});
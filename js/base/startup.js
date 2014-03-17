btg.eventManager.addListener('startup', function() {

    console.log('startup');


    /**
     * 初始化socket
     */
    btg.initSocket();
});
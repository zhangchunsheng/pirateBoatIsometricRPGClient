(function()
{
    if (typeof window.CocoonJS === 'undefined' || window.CocoonJS === null) throw("The CocoonJS object must exist and be valid before adding more functionalities to an extension.");
    if (typeof window.CocoonJS.App === 'undefined' || window.CocoonJS.App === null) throw("The CocoonJS.App object must exist and be valid before adding more functionalities to it.");

    /**
    * This namespace represents all the basic functionalities available in the CocoonJS extension API.
    * @namespace
    */
    CocoonJS.App = CocoonJS.App ? CocoonJS.App : {};

    if (!CocoonJS.App.nativeExtensionObjectAvailable)
    {
        (function createWebView() { 
            CocoonJS.App.EmulatedWebView = document.createElement('div'); 
            CocoonJS.App.EmulatedWebView.setAttribute('id', 'CocoonJS_App_ForCocoonJS_WebViewDiv'); 
            CocoonJS.App.EmulatedWebView.style.width = 0; 
            CocoonJS.App.EmulatedWebView.style.height = 0; 
            CocoonJS.App.EmulatedWebView.style.position = ""; 
            CocoonJS.App.EmulatedWebView.style.left = 0; 
            CocoonJS.App.EmulatedWebView.style.top = 0;
            CocoonJS.App.EmulatedWebView.style.backgroundColor = 'transparent';
            CocoonJS.App.EmulatedWebView.style.border = "0px solid #000"; 
            CocoonJS.App.EmulatedWebViewIFrame = document.createElement("iframe"); 
            CocoonJS.App.EmulatedWebViewIFrame.setAttribute('id', 'CocoonJS_App_ForCocoonJS_WebViewIFrame');
            CocoonJS.App.EmulatedWebViewIFrame.setAttribute('name', 'CocoonJS_App_ForCocoonJS_WebViewIFrame');
            CocoonJS.App.EmulatedWebViewIFrame.style.width = 0; 
            CocoonJS.App.EmulatedWebViewIFrame.style.height = 0; 
            CocoonJS.App.EmulatedWebViewIFrame.frameBorder = 0;
            CocoonJS.App.EmulatedWebViewIFrame.allowtransparency = true;
			
            CocoonJS.App.EmulatedWebView.appendChild(CocoonJS.App.EmulatedWebViewIFrame);
            document.body.appendChild(CocoonJS.App.EmulatedWebView);
        })(); 
    }

    /**
    * Pauses the CocoonJS JavaScript execution loop.
    * @function
    * @augments CocoonJS.App
    */
    CocoonJS.App.pause = function()
    {
        if (CocoonJS.App.nativeExtensionObjectAvailable)
        {
            return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_APP", "pause", arguments);
        }
    };

    /**
    * Resumes the CocoonJS JavaScript execution loop.
    * @static
    * @function
    */
    CocoonJS.App.resume = function()
    {
        if (CocoonJS.App.nativeExtensionObjectAvailable)
        {
            return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_APP", "resume", arguments);
        }
    };

    /**
    * Loads a resource in the WebView environment from the CocoonJS environment.
    * @function
    * @param {string} path The path to the resource. It can be a remote URL or a path to a local file.
    * @param {CocoonJS.App.StorageType} [storageType] An optional parameter to specify at which storage in the device the file path is stored. By default, APP_STORAGE is used.
    * @see CocoonJS.App.load
    * @see CocoonJS.App.onLoadInTheWebViewSucceed
    * @see CocoonJS.App.onLoadInTheWebViewFailed
    */
    CocoonJS.App.loadInTheWebView = function(path, storageType)
    {
        if (CocoonJS.App.nativeExtensionObjectAvailable)
        {
            // TODO: All this code should be changed to a simple call makeNativeExtensionObjectFunctionCall when the native argument control is improved.
            var javaScriptCodeToForward = "ext.IDTK_APP.makeCall('loadPath'";
            if (typeof path !== 'undefined')
            {
                javaScriptCodeToForward += ", '" + path + "'";
                if (typeof storageType !== 'undefined')
                {
                    javaScriptCodeToForward += ", '" + storageType + "'";
                }
            }
            javaScriptCodeToForward += ");";

            return CocoonJS.App.forwardAsync(javaScriptCodeToForward);
        }
        else if (!navigator.isCocoonJS)
        {
            var xhr = new XMLHttpRequest();

            xhr.onreadystatechange = function(event) {
                if (xhr.readyState === 4)
                {
                    if (xhr.status === 200)
                    {
                        var callback= function(event){
                            CocoonJS.App.onLoadInTheWebViewSucceed.notifyEventListeners(path);
                            CocoonJS.App.EmulatedWebViewIFrame.removeEventListener("load", callback);
                        };

                        CocoonJS.App.EmulatedWebViewIFrame.addEventListener(
                            "load", 
                            callback
                        );
                        CocoonJS.App.EmulatedWebViewIFrame.contentWindow.location.href= path;
                    }
                    else if (xhr.status === 404)
                    {
                        this.onreadystatechange = null;
                        CocoonJS.App.onLoadInTheWebViewFailed.notifyEventListeners(path);
                    }
                }
            };
            xhr.open("GET", path, true);
            xhr.send();
        }
    };

    /**
    * Shows the webview.
    * @function
    * @param {int} x The top lef x coordinate of the rectangle where the webview will be shown.
    * @param {int} y The top lef y coordinate of the rectangle where the webview will be shown.
    * @param {width} y The width of the rectangle where the webview will be shown.
    * @param {height} y The height of the rectangle where the webview will be shown.
    */
    CocoonJS.App.showTheWebView = function(x, y, width, height)
    {
        if (CocoonJS.App.nativeExtensionObjectAvailable)
        {
            var javaScriptCodeToForward = "ext.IDTK_APP.makeCall('show'";
            if (typeof x !== 'undefined' && typeof y !== 'undefined' && typeof width !== 'undefined' && typeof height !== 'undefined')
            {
                javaScriptCodeToForward += ", " + x + ", " + y + ", " + width + ", " + height;
            }
            javaScriptCodeToForward += ");";

            return CocoonJS.App.forwardAsync(javaScriptCodeToForward);
        }
        else if (!navigator.isCocoonJS)
        {
            CocoonJS.App.EmulatedWebViewIFrame.style.width = (width ? width : window.innerWidth)+'px';
            CocoonJS.App.EmulatedWebViewIFrame.style.height = (height ? height : window.innerHeight)+'px';
            CocoonJS.App.EmulatedWebView.style.left = (x ? x : 0)+'px';
            CocoonJS.App.EmulatedWebView.style.top = (y ? y : 0)+'px';
            CocoonJS.App.EmulatedWebView.style.width = (width ? width : window.innerWidth)+'px';
            CocoonJS.App.EmulatedWebView.style.height = (height ? height : window.innerHeight)+'px';
            CocoonJS.App.EmulatedWebView.style.display = "block";
        }
    };

    /**
    * Hides the webview.
    * @function
    */
    CocoonJS.App.hideTheWebView = function()
    {
        if (CocoonJS.App.nativeExtensionObjectAvailable)
        {
            var javaScriptCodeToForward = "ext.IDTK_APP.makeCall('hide');";
            return CocoonJS.App.forwardAsync(javaScriptCodeToForward);
        }
        else if (!navigator.isCocoonJS)
        {
            CocoonJS.App.EmulatedWebView.style.display = "none";
        }
    };

    /**
    * Marks a audio file to be used as music by the system. CocoonJS, internally, differentiates among music files and sound files.
    * Music files are usually bigger in size and longer in duration that sound files. There can only be just one music file 
    * playing at a specific given time. The developer can mark as many files as he/she wants to be treated as music. When the corresponding
    * HTML5 audio object is used, the system will automatically know how to treat the audio resource as music or as sound.
    * Note that it is not mandatory to use this function. The system automatically tries to identify if a file is suitable to be treated as music
    * or as sound by checking file size and duration thresholds. It is recommended, though, that the developer specifies him/herself what he/she considers
    * to be music.
    * @function
    * @param {string} audioFilePath The same audio file path that will be used to create HTML5 audio objects.
    */
    CocoonJS.App.markAsMusic = function(audioFilePath)
    {
        if (CocoonJS.App.nativeExtensionObjectAvailable)
        {
           return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_APP", "addForceMusic", arguments);
        }
    };

    /**
    * Activates or deactivates the antialas functionality from the CocoonJS rendering.
    * @function
    * @param {boolean} enable A flag that indicates if the antialas should be activated (true) or deactivated (false).
    */
    CocoonJS.App.setAntialias = function(enable)
    {
        if (CocoonJS.App.nativeExtensionObjectAvailable)
        {
           return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_APP", "setDefaultAntialias", arguments);
        }
    };

    /**
    * Sets a callback function that will be called whenever the system tries to finish the app.
    * The developer can specify how the system will react to the finish of the app by returning a
    * boolean value in the callback function: true means, close the app, false means that the developer
    * will handle the app close.
    * A common example of this is the back button in Android devices. When the back button is pressed, this
    * callback will be called and the system will react depending on the developers choice finishing, or not,
    * the application.
    * @function
    * @param {function} appShouldFinishCallback A function object that will be called when the system
    * determines that the app should be finished. This function must return a true or a false value
    * depending on what the developer wants: true === finish the app, false === do not close the app.
    */
    CocoonJS.App.setAppShouldFinishCallback = function(appShouldFinishCallback)
    {
        if (navigator.isCocoonJS)
        {
            window.onidtkappfinish = appShouldFinishCallback;
        }
    }

    /**
    * Sets the texture reduction options. The texture reduction is a process that allows big images to be reduced/scaled down when they are loaded.
    * Although the quality of the images may decrease, it can be very useful in low end devices or those with limited amount of memory.
    * The function sets the threshold on image size (width or height) that will be used in order to know if an image should be reduced or not.
    * It also allows to specify a list of strings to identify in which images file paths should be applied (when they meet the size threshold requirement) 
    * The developer will still think that the image is of the original size. CocoonJS handles all of the internals to be able to show the image correctly.
    * IMPORTANT NOTE: This function should be called when the application is initialized before any image is set to be loaded for obvious reasons ;).
    * and in which sould be forbid (even if they meet the threshold requirement).
    * @function
    * @param {number} sizeThreshold This parameter specifies the minimun size (either width or height) that an image should have in order to be reduced.
    * @param {string or array} [applyTo] This parameter can either be a string or an array of strings. It's purpose is to specify one (the string) or more (the array) substring(s) 
    * that will be compared against the file path of an image to be loaded in order to know if the reduction should be applied or not. If the image meets the
    * threshold size requirement and it's file path contains this string (or strings), it will be reduced. This parameter can also be null.
    * @param {string or array} [forbidFor] This parameter can either be a string or an array of strings. It's purpose is to specify one (the string) or more (the array) substring(s) 
    * that will be compared against the file path of an image to be loaded in order to know if the reduction should be applied or not. If the image meets the
    * threshold size requirement and it's file path contains this string (or strings), it won't be reduced. This parameter should be used in order to mantain the 
    * quality of some images even they meet the size threshold requirement.
    */
    CocoonJS.App.setTextureReduction = function(sizeThreshold, applyTo, forbidFor)
    {
        if (CocoonJS.App.nativeExtensionObjectAvailable)
        {
            return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_APP", "setDefaultTextureReducerThreshold", arguments);
        }
    };


    /**
    * Prints to the console the memory usage of the currently alive textures
    * @function
    */
    CocoonJS.App.logMemoryInfo = function()
    {
        if (CocoonJS.App.nativeExtensionObjectAvailable)
        {
            return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_APP", "logMemoryInfo", arguments);
        }
    };
	
	/**
    * Setups a CocoonJS to WebView proxy for a given typeName. What this means is that after calling this function the CocoonJS environment will suddenly
    * have a way of creating instances of the given typeName and those instances will act as a transparent proxy to counterpart instances in the webview.
    * Manipulating attributes, calling funcitions or handling events will all be performed in the webview but the developer will think they will be
    * happening in the CocoonJS environment.
    * IMPORTANT NOTE: These proxies only work with types that use attributes and function parameters and return types that are primitive like numbers, strings or arrays.
    * @param {string} typeName The name of the type to be proxified.
    * @param {array} [attributeNames] A list of the names of the attributes to be proxified.
    * @param {array} [functionNames] A list of the names of the functions to be proxified.
    * @param {array} [eventHandlerNames] A list of the names of the event handlers to be proxified (onXXXX like attributes that represent callbacks).
    * A valid typeName and at least one valid array for attribute, function or event handler names is mandatory.
    */
    CocoonJS.App.setupWebViewProxyType = function(typeName, attributeNames, functionNames, eventHandlerNames)
    {
        if (CocoonJS.App.nativeExtensionObjectAvailable)
        {
            // Control the parameters.
            if (!typeName) throw "The given typeName must be valid.";
            if (!attributeNames && !functionNames && !eventHandlerNames) throw "There is no point on setting up a proxy for no attributes, functions nor eventHandlers.";
            attributeNames = attributeNames ? attributeNames : [];
            functionNames = functionNames ? functionNames : [];
            eventHandlerNames = eventHandlerNames ? eventHandlerNames : [];

            // The parent object will be the window. It could another object but careful, the webview side should know about this.
            // TODO: Specify the parentObject as a parameter, obtain it's path to window and pass it to the webview so it knows.
            var parentObject = window;

            // Setup the webview side too.
            var jsCode = "CocoonJS.App.setupCocoonJSProxyType(" + JSON.stringify(typeName) + ", " + JSON.stringify(eventHandlerNames) + ");";
            CocoonJS.App.forward(jsCode);

            // The proxy type to the webview. Instances of this type will be created by the developer without knowing that they are
            // internally calling to their counterparts in the webview.
            parentObject[typeName] = function()
            {
                var _this = this;

                // Each proxy object will have a "cocoonjs" object inside with all the necessary information to be a proxy to the webview.
                this.cocoonjs = {};
                // The id is obtained calling to the webview side to create an instance of the type.
                var jsCode = "CocoonJS.App.newCocoonJSProxyObject(" + JSON.stringify(typeName) + ");";
                this.cocoonjs.id = CocoonJS.App.forward(jsCode);
                // The eventHandlers array contains objects of the type { eventHandlerName : string, eventHandler : function } to be able to make the callbacks when the 
                // webview makes the corresponding calls.
                this.cocoonjs.eventHandlers = [];
                // Also store the typename inside each instance.
                this.cocoonjs.typeName = typeName;

                // Store all the proxy instances in a list that belongs to the type itself.
                parentObject[typeName].cocoonjs.objects.push(this);

                /**
                * Performs a call to a function to the counterpart instance of this proxy object in the webview.
                * @param {string} functioName The name of the function to be called.
                * @apram {object} arguments The arguments object from the function that has been called in the CocoonJS (it contains all the arguments that have been passed to it).
                * @return Whatever the call to the webview counterpart returns.
                */
                this.cocoonjs.callCocoonJSProxyObjectFunctionInTheWebview = function(functionName, arguments)
                {
                    // Get the arguments as an array and add the typeName, the proxy id and the functionName before all the other arguments before making the call to the webview counterpart.
                    var argumentsArray = Array.prototype.slice.call(arguments);
                    argumentsArray.unshift(functionName);
                    argumentsArray.unshift(this.id);
                    argumentsArray.unshift(typeName);
                    // Use the array to create the correct function call.
                    var jsCode = "CocoonJS.App.callCocoonJSProxyObjectFunction(";
                    for (var i = 0; i < argumentsArray.length; i++)
                    {
                        jsCode += JSON.stringify(argumentsArray[i]) + (i < argumentsArray.length - 1 ? ", " : "");
                    }
                    jsCode += ");";
                    var ret = CocoonJS.App.forward(jsCode);
                    return ret;
                };

                /**
                * Find the corresponding event handler for the given eventHandlerName.
                * @param {string} eventHandlerName The name of the event handler to look for in the cocoonjs structure's event handler array.
                * @return The eventHandler structure { eventHandlerName : string, eventHandler : function } if it is found or null if not.
                */
                this.cocoonjs.findEventHandler = function(eventHandlerName)
                {
                    var eventHandler = null;
                    for (var i = 0; eventHandler == null && i < this.eventHandlers.length; i++)
                    {
                        eventHandler = this.eventHandlers[i].eventHandlerName === eventHandlerName ? this.eventHandlers[i] : null;
                    }
                    return eventHandler;
                };

                // Create a setter and a getter for all the attribute names that have been specified. When the attributes are accessed (set or get) a call to the webview counterpart will be performed.
                for (var i = 0; i < attributeNames.length; i++)
                {
                    (function(attributeName)
                    {
                        _this.__defineSetter__(attributeName, function(value)
                        {
                            var jsCode = "CocoonJS.App.setCocoonJSProxyObjectAttribute(" + JSON.stringify(typeName) + ", " + _this.cocoonjs.id + ", " + JSON.stringify(attributeName) + "', " + JSON.stringify(value) + ");";
                            return CocoonJS.App.forward(jsCode);
                        });
                        _this.__defineGetter__(attributeName, function()
                        {
                            var jsCode = "CocoonJS.App.getCocoonJSProxyObjectAttribute(" + JSON.stringify(typeName) + ", " + _this.cocoonjs.id + ", '" + attributeName + "');";
                            return CocoonJS.App.forward(jsCode);
                        });
                    })(attributeNames[i]);
                }

                // Create a function that performs a call to the webview counterpart for all the function names that have been specified.
                for (var i = 0; i < functionNames.length; i++)
                {
                    (function(functionName)
                    {
                        _this[functionName] = function()
                        {
                            return _this.cocoonjs.callCocoonJSProxyObjectFunctionInTheWebview(functionName, arguments);
                        };
                    })(functionNames[i]);
                }

                // Create a setter and getter for all the event handler names that have been specified. When the event handlers are accessed, store them inside the corresponding position on the eventHandlers
                // array so they can be called when the webview makes the corresponding callback call.
                for (var i = 0; i < eventHandlerNames.length; i++)
                {
                    (function(eventHandlerName)
                    {
                        _this.__defineSetter__(eventHandlerName, function(value)
                        {
                            // First of all look for the event handler. If it exists, reuse it (just change the callback reference) and if not, create a new one.
                            var eventHandler = _this.cocoonjs.findEventHandler(eventHandlerName);
                            if (eventHandler)
                            {
                                eventHandler.eventHandler = value;
                            }
                            else
                            {
                                _this.cocoonjs.eventHandlers.push( { eventHandlerName : eventHandlerName, eventHandler : value } );
                            }
                        });
                        _this.__defineGetter__(eventHandlerName, function()
                        {
                            var eventHandler = _this.cocoonjs.findEventHandler(eventHandlerName);
                            return eventHandler ? eventHandler.eventHandler : null;
                        });
                    })(eventHandlerNames[i]);
                }

                // Return the proxy instance.
                return this;
            };

            // The type will contain a cocoonjs structure to store all the instances that are created so they are available when the webview calls.
            parentObject[typeName].cocoonjs = 
            {
                objects : []
            };

            /**
            * Deletes a proxy instance from both the CocoonJS environment structures and also deleting it's webview environment counterpart.
            * This function should be manually called whenever a proxy instance won't be accessed anymore.
            * @param {object} object The proxy object to be deleted.
            */
            parentObject[typeName].cocoonjs.deleteObject = function(object)
            {
                var objectIndex = this.objects.indexOf(object);
                this.objects.splice(objectIndex, 1);
                var jsCode = "CocoonJS.App.deleteCocoonJSProxyObject(" + JSON.stringify(typeName) + ", " + object.cocoonjs.id + ");";
                CocoonJS.App.forward(jsCode);
                object.cocoonjs = null;
            };

            /**
            * Searchs for a proxy object using the given id.
            * @param {number} id The id to be used to look for the proxy object in the type's all the instances array.
            * @return The corresponding proxy object if it's found or null if not.
            */
            parentObject[typeName].cocoonjs.findObjectForId = function(id)
            {
                var object = null;
                for (var i = 0; object == null && i < this.objects.length; i++)
                {
                    object = this.objects[i].cocoonjs.id === id ? this.objects[i] : null;
                }
                return object;
            };

            /**
            * Calls a event handler for the given proxy object id and eventHandlerName.
            * @param {number} id The id to be used to look for the proxy object for which to make the call to it's event handler.
            * @param {string} eventHandlerName The name of the handler to be called.
            * NOTE: Events are a complex thing in the HTML specification. This function just performs a call but at least provides a 
            * structure to the event passing the target (the proxy object).
            * TODO: The webview should serialize the event object as far as it can so many parameters can be passed to the CocoonJS
            * side. Using JSON.stringify in the webview and parse in CocoonJS maybe? Still must add the target to the event structure though.
            */
            parentObject[typeName].cocoonjs.callEventHandler = function(id, eventHandlerName)
            {
                var object = this.findObjectForId(id);
                var eventHandler = object.cocoonjs.findEventHandler(eventHandlerName);
                if (eventHandler)
                {
                    eventHandler.eventHandler( { target : object } );
                }
            };
        }
    };

    /**
    * Enable CocoonJS Webview FPS overlay.
    * @function
    */
    CocoonJS.App.enableFPSInTheWebView = function(fpsLayout, textColor)
    {
        if (!CocoonJS.App.fpsInTheWebViewEnabled)
        {
            fpsLayout = fpsLayout ? fpsLayout : CocoonJS.App.FPSLayout.TOP_RIGHT;
            textColor = textColor ? textColor : "white";
            var jsCode = "" +
                "(function()" +
                "{" +
                    "var COCOONJS_WEBVIEW_EXTENSION_SCRIPT_FILES = ['js/CocoonJSExtensions/CocoonJS.js', 'js/CocoonJSExtensions/CocoonJS_App.js', 'js/CocoonJSExtensions/CocoonJS_App_ForWebView.js'];" +
                    "var loadedScriptCounter = 0;" + 
                    "var loadedScriptFunction = function() " +
                    "{ " +
                        "loadedScriptCounter++;"+
                        "if (loadedScriptCounter >= COCOONJS_WEBVIEW_EXTENSION_SCRIPT_FILES.length)"+
                        "{"+
                            "CocoonJS.App.enableFPS(" + JSON.stringify(fpsLayout) + ", " + JSON.stringify(textColor) + ");"+
                        "}"+
                    "};"+
                    "for (var i = 0; i < COCOONJS_WEBVIEW_EXTENSION_SCRIPT_FILES.length; i++)"+
                    "{"+
                        "var s = document.createElement('script');"+
                        "s.onload = loadedScriptFunction;"+
                        "s.src = COCOONJS_WEBVIEW_EXTENSION_SCRIPT_FILES[i];"+
                        "document.body.appendChild(s);"+
                    "}" +
                "})();";
            setTimeout(function()
            {
                CocoonJS.App.forward(jsCode);
            }, 3000);
            CocoonJS.App.fpsInTheWebViewEnabled = true;
        }
    };

    /**
    * Disable CocoonJS Webview FPS overlay.
    * @function
    */
    CocoonJS.App.disableFPSInTheWebView = function()
    {
        // TODO: Implement this function.
    };

    /**
     * FOR DOCUMENTATION PURPOSE ONLY! The documentation of the function callback for the {@link CocoonJS.App.onLoadInTheWebViewSucceed} event calls.
     * @name OnLoadInTheWebViewSucceedListener
     * @function
     * @static
     * @memberOf CocoonJS.App
     * @param {string} pageURL The URL of the page that had been loaded in the webview.
     */
    /**
    * This {@link CocoonJS.EventHandler} object allows listening to events called when the WebView load has completed successfully.
    * The callback function's documentation is represented by {@link CocoonJS.App.OnLoadInTheWebViewSucceedListener}
    * @event
    * @static
    * @memberOf CocoonJS.App
    * @param {string} pageURL A string that represents the page URL loaded.
    */
    CocoonJS.App.onLoadInTheWebViewSucceed = new CocoonJS.EventHandler("IDTK_APP", "App", "forwardpageload");

    /**
     * FOR DOCUMENTATION PURPOSE ONLY! The documentation of the function callback for the {@link CocoonJS.App.onLoadInTheWebViewFailed} event calls.
     * @name OnLoadInTheWebViewFailedListener
     * @function
     * @static
     * @memberOf CocoonJS.App
     * @param {string} pageURL The URL of the page that had been loaded in the webview.
     */
    /**
    * This {@link CocoonJS.EventHandler} object allows listening to events called when the WebView load fails.
    * The callback function's documentation is represented by {@link CocoonJS.App.OnLoadInTheWebViewFailedListener}
    * @event
    * @static
    * @memberOf CocoonJS.App
    */
    CocoonJS.App.onLoadInTheWebViewFailed = new CocoonJS.EventHandler("IDTK_APP", "App", "forwardpagefail");
    
})();
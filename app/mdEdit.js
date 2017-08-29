/**
 * Application Angular JS mdEditApp
 */

angular.module('mdEdit.services', []);
angular.module('mdEdit.filters', []);
angular.module('mdEdit.directives', []);
// Déclaration du module mdEdit
// angular.module('mdEdit', ['ui.bootstrap', 'mdEdit.services', 'mdEdit.directives', 'mdEdit.filters', 'modalDoc', 'modalSetXml', 'modalGetXml']);
angular.module('mdEdit', ['ui.bootstrap', 'mdEdit.services', 'mdEdit.directives', 'mdEdit.filters', 'modalDoc']);

angular.module('mdEdit.directives')
    .config(function($locationProvider) {
        $locationProvider.html5Mode(true);
    });

angular.module('mdEdit')
    .run(['configSrv', 'modelsSrv', 'viewsSrv', 'localesSrv', 'xmlSrv', 'AppDataSrv', 'BroadcastSrv', runApp]);


function runApp(configSrv, modelsSrv, viewsSrv, localesSrv, xmlSrv, AppDataSrv, BroadcastSrv) {

    // Get data from config
    function getData(data) {
        AppDataSrv.config = data;
        AppDataSrv.static_url = AppDataSrv.config.static_url;
        getLocales(AppDataSrv.config.locales_path);
        AppDataSrv.userLanguage = localesSrv.getLanguage(AppDataSrv.config.defaultLanguage);
        getLocale(AppDataSrv.userLanguage);
        getViews(AppDataSrv.userLanguage);
        AppDataSrv.locales = data.locales;
    };

    getData(config);

    // Get locales list from translate service
    function getLocales(localesPath) {
        if (Object.prototype.toString.call(localesPath) === '[object Object]') {
            return localesPath;
        } else {
            localesSrv.getLocales(localesPath)
                .then(function(data) {
                    AppDataSrv.locales = data.locales;
                });
        };
    }

    // Get locales from translate service
    function getLocale(userLanguage) {
        localesSrv.getLocale(AppDataSrv.config.locales_path, userLanguage)
            .then(function(data) {
                AppDataSrv.ui = data.ui;
                AppDataSrv.md_errors = data.md_errors;
                AppDataSrv.codelists = data.codelists;
            });
    }

    // Get list of view from views service
    // Get locales from views service (get URL param or the first item of models list)
    function getViews(userLanguage) {
        if (Object.prototype.toString.call(AppDataSrv.config.views_file) === '[object Object]') {
            AppDataSrv.views = AppDataSrv.config.views_file.list;
            viewsSrv.getViewLocales(false, AppDataSrv.views, userLanguage, function(view, data) {
                AppDataSrv.view = view;
                AppDataSrv.fields = data.fields;
            });
            getModels();
        } else {
            viewsSrv.getList(AppDataSrv.config.views_file, function(data) {
                    AppDataSrv.views = data;
                })
                .then(function() {
                    viewsSrv.getViewLocales(false, AppDataSrv.views, userLanguage, function(view, data) {
                        AppDataSrv.view = view;
                        AppDataSrv.fields = data.fields;
                    });
                    getModels();
                });
        };
    }

    // Get list of models from models service
    // Get model from models service (get URL param or the first item of models list)
    function getModels() {
        if (Object.prototype.toString.call(AppDataSrv.config.models_file) === '[object Object]') {
            AppDataSrv.models = AppDataSrv.config.models_file.list;
            if (xmlSrv.getXml()) {
                BroadcastSrv.send('configLoaded');
            } else {
                modelsSrv.getModel(AppDataSrv.models, false, function(model) {
                    BroadcastSrv.send('configLoaded');
                });
            };
        } else {
            modelsSrv.getList(AppDataSrv.config.models_file, function(data) {
                    AppDataSrv.models = data;
                })
                .then(function() {
                    // If 'xml' query parameters is defined, load XML else load model (from query parameter 'model' or default model)
                    if (xmlSrv.getXml()) {
                        // Send configLoaded signal to start mdEdit controller
                        BroadcastSrv.send('configLoaded');
                    } else {
                        modelsSrv.getModel(AppDataSrv.models, false, function(model) {
                            // Send configLoaded signal to start mdEdit controller
                            BroadcastSrv.send('configLoaded');
                        });
                    }
                });
        };
    }
}

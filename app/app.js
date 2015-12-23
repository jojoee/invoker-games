'use strict';

/*================================================================
  #INIT
  ================================================================*/

angular
  .module(appName, ['ngRoute', 'LocalStorageModule', 'cfp.hotkeys'])
  .config(function (appConstant, localStorageServiceProvider) {
    var appPrefix = appConstant.appPrefix;
    localStorageServiceProvider.setPrefix(appPrefix);
  })
  .run(['$log', function ($log) {
    $log.log('run run()');
  }]);

/*================================================================
  #CONSTANT
  ================================================================*/

angular
  .module(appName)
  .constant('appConstant', {
    name : 'Invoker Games',
    cssPath: 'css',
    jsPath: 'js',
    imgPath: 'img',
    jsonPath: 'json',

    // resource
    skillJsonPath: 'json/skills.json',

    // local storage
    appPrefix: 'invoApp',
    appSkillDataName: 'skills'
  }
);

/*================================================================
  #VALUE
  ================================================================*/

angular
  .module(appName)
  .value('keyValue', {
    'quas': 'q',
    'wex': 'w',
    'exort': 'e',
    'invoke': 'r',
    'spell1': 'd',
    'spell2': 'f'
  }
);

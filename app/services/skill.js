'use strict';

/*================================================================
  #SKILL
  ================================================================*/

angular
  .module(appName)
  .factory('skillService', skillService);

skillService.$inject = ['$log', '$http', 'appConstant'];

function skillService($log, $http, appConstant) {
  var skillJsonPath = appConstant.skillJsonPath;
  var skills = null;

  if (skills) {
    $log.log('skillService - found skill\'s data');

  } else {
    $log.log('skillService - not found skill\'s data');

    return {
      get: function() {
        return $http.get(skillJsonPath);
      }
    };
  }
}

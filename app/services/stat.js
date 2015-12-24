'use strict';

/*================================================================
  #STAT
  ================================================================*/

angular
  .module(appName)
  .factory('statService', statService);

statService.$inject = [];

function statService() {
  var startedStats = {
    'nPressed': 0,
    'nSkillInvoked': 0,
    'nTargetedSkillInvoked': 0,
    'nCombination': 0, // unused
    'nStage': 0,
    'nPressedPerSkill': 0,
    'nPressedPerTargetedSkill': 0,
    'latestKey': '-'
  };

  // copy object not by reference
  var stats = JSON.parse(JSON.stringify(startedStats));

  return {
    get: function() {
      return stats;
    },
    reset: function() {
      return startedStats;
    }
  }
}

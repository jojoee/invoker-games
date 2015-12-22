'use strict';

var appName = 'invoApp';

/*================================================================
  #INIT
  ================================================================*/

angular.module(appName, ['ngRoute', 'LocalStorageModule', 'cfp.hotkeys'])
.config(function(appConstant, localStorageServiceProvider){
  var appPrefix = appConstant.appPrefix;
  localStorageServiceProvider.setPrefix(appPrefix);
})
.run(['$log', function ($log) {
  $log.log('run run()');
}]);

/*================================================================
  #CONSTANT
  ================================================================*/

angular.module(appName).constant('appConstant', {
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
});

/*================================================================
  #VALUE
  ================================================================*/

angular.module(appName).value('keyValue', {
  'quas': 'q',
  'wex': 'w',
  'exort': 'e',
  'invoke': 'r',
  'spell1': 'd',
  'spell2': 'f'
});

/*================================================================
  #FACTORY
  ================================================================*/

angular.module(appName).factory('skillService', ['$log', '$http', 'appConstant', function ($log, $http, appConstant) {
  var skillJsonPath = appConstant.skillJsonPath;
  var skills = null;

  if (skills) {
    $log.log('skillService - found skill\'s data');

  } else {
    $log.log('skillService - not found skill\'s data');

    return {
      get: function () {
        return $http.get(skillJsonPath);
      }
    };
  }
}]);

angular.module(appName).factory('statService', function () {
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
    get: function () {
      return stats;
    },
    reset: function () {
      return startedStats;
    }
  }
});

/*================================================================
  #CONTROLLER
  ================================================================*/

angular.module(appName).controller('mainController', [
  '$scope', '$http', '$log', // angular core
  'localStorageService', 'hotkeys', // third party
  'appConstant', 'skillService', 'keyValue', 'statService', // app
  function ($scope, $http, $log, localStorageService, hotkeys, appConstant, skillService, keyValue, statService) {

  var imgPath = appConstant.imgPath;
  var appSkillDataName = appConstant.appSkillDataName;

  // gameStage
  // - start
  // - over
  $scope.gameStage = 'start'; // unused
  $scope.key = keyValue;
  $scope.stats = statService.get();
  $scope.invokedOrbs = ['', '', '']; // starter key pressed
  $scope.skills = localStorageService.get(appSkillDataName); // null
  $scope.nSkill = 0;
  $scope.targetedSkill = null;
  $scope.invokedSkills = [null, null]; // only 2 skills

  /* ================================================================ PRIVATE - HELPER
  */

  var hasNoInvokedSkill = function () {
    return $scope.invokedSkills[0] === null;
  }

  // unused
  var hasOneInvokedSkill = function () {
    if ($scope.invokedSkills[0] !== null &&
      $scope.invokedSkills[1] === null) {
      return true;

    } else {
      return false;
    }
  }

  var updateNPressedPerSkill = function () {
    if ($scope.stats.nSkillInvoked > 0) {
      $scope.stats.nPressedPerSkill = $scope.stats.nPressed / $scope.stats.nSkillInvoked;
    }
  }

  var updateNPressedPerTargetedSkill = function () {
    if ($scope.stats.nTargetedSkillInvoked > 0) {
      $scope.stats.nPressedPerTargetedSkill = $scope.stats.nPressed / $scope.stats.nTargetedSkillInvoked;
    }
  }

  var getTargetedSkill = function () {
    var randomSkillIdx = _.random(0, $scope.nSkill - 1);
    var randomSkill = $scope.skills[randomSkillIdx];
    var randomSkillKey = randomSkill.key;

    // first generate targeted skill (no invoked skill)
    if (hasNoInvokedSkill()) {
      return randomSkill;

    // has one invoked skill and
    // otherwise
    } else {
      if (randomSkill.key === $scope.invokedSkills[0].key) {
        $log.log('generated skill is duplicate with latest invoked skill, it will generate new one');

        return getTargetedSkill();
        
      } else {
        return randomSkill
      }
    }

    return randomSkill;
  }

  var updateInvokedSkills = function (skill) {
    // first invoked skill
    if (hasNoInvokedSkill()) {
      $scope.invokedSkills[0] = skill;

    // second invoked skill and
    // otherwise
    } else {
      $scope.invokedSkills[1] = $scope.invokedSkills[0];
      $scope.invokedSkills[0] = skill;
    }
  }

  var orderAllSkillOrbs = function () {
    angular.forEach($scope.skills, function (val, key) {
      $scope.skills[key].orbs = _.sortBy(val.orbs);
    });
  }

  var initSkillData = function () {
    if (! $scope.skills) {
      $log.log('not found skill\'s data in local storage');

      skillService.get().then(function (res) {
        var skills = res.data;
        var skillsJson = angular.toJson(skills);

        $scope.skills = skills
        $scope.nSkill = $scope.skills.length;

        $scope.setTargetedSkill();

        localStorageService.set(appSkillDataName, skillsJson); // save skill's data into local storage
      });

    } else {

      $scope.skills = JSON.parse($scope.skills);
      $scope.nSkill = $scope.skills.length;

      $scope.setTargetedSkill();
    }

    orderAllSkillOrbs();

    $log.debug('$scope.skills', $scope.skills);
    $log.debug('$scope.nSkill', $scope.nSkill);
  }

  $scope.setTargetedSkill = function() {
    $scope.targetedSkill = getTargetedSkill();

    $log.debug('$scope.targetedSkill', $scope.targetedSkill);
  }

  // have to order it first
  // compare one deeped array only
  // 
  // http://stackoverflow.com/questions/28947253/sort-array-with-lodash-by-value-integer
  // http://stackoverflow.com/questions/29951293/using-lodash-to-compare-arrays
  $scope.isSameOrbArr = function (orderedArr1, orderedArr2) {
    return _.isEqual(orderedArr1, orderedArr2);
  }

  $scope.getSpellCssClass = function (idx) {
    var skill = $scope.invokedSkills[idx];
    var cssClass = (skill) ? $scope.getSkillCssClass(skill.key) : '';

    return cssClass;
  }

  $scope.validateSkill = function (invokedSkill) {
    if (invokedSkill) {
      if (invokedSkill.key === $scope.targetedSkill.key) {
        $log.log('valid skill');

        // generate new targeted skill
        $scope.setTargetedSkill();

        // update stat
        $scope.stats.nStage++;
        $scope.stats.nTargetedSkillInvoked++;
        updateNPressedPerTargetedSkill();

      } else {
        $log.log('not valid skill');
      }
    }
  }

  /* ================================================================ PUBLIC - HELPER & INIT
  */
  
  // unused
  $scope.getSkillImgPath = function (fileName) {
    return imgPath + '/' + fileName;
  };

  $scope.getSkillCssClass = function (skillKey) {
    return 'skill-' + skillKey;
  };

  $scope.getOrbClass = function (orb) {
    var orbClass = 'orb-quas';

    switch (orb) {
      case 'q':
        orbClass = 'orb-quas';
        break;
      case 'w':
        orbClass = 'orb-wex';
        break;
      case 'e':
        orbClass = 'orb-exort';
        break;
    }

    return orbClass;
  }

  $scope.init = function () {
    initSkillData();
  }

  /* ================================================================ PUBLIC - EVENT
  */

  $scope.updateKeyPress = function (key) {
    // update invoked orbs
    $scope.invokedOrbs.shift(); // remove zero index
    $scope.invokedOrbs.push(key); // add new key

    // update stat
    $scope.stats.nPressed++;
    $scope.stats.latestKey = key;
    updateNPressedPerSkill();
  }

  $scope.invokeSkill = function () {
    var loopFlag = true;
    var invokedSkill = null;
    var invokedOrbs = _.sortBy($scope.invokedOrbs);

    angular.forEach($scope.skills, function (skill, key) {
      if (loopFlag) {
        if ($scope.isSameOrbArr(invokedOrbs, skill.orbs)) {
          invokedSkill = skill;
          loopFlag = false; // break
        }
      }
    });

    var invokedSkill1Key = ($scope.invokedSkills[0]) ? $scope.invokedSkills[0].key : '';
    var invokedSkill2Key = ($scope.invokedSkills[1]) ? $scope.invokedSkills[0].key : '';

    if (invokedSkill.key) {
      if (invokedSkill.key !== invokedSkill1Key &&
        invokedSkill.key !== invokedSkill2Key) {
        $log.log('valid orbs');

        // update invoked skill
        updateInvokedSkills(invokedSkill);

        // update stat
        $scope.stats.nSkillInvoked++;
        updateNPressedPerSkill();

      } else {
        $log.log('skill already invoked');
      }
      
    } else {
      // impossible
      $log.log('not valid orbs');
    }

    // update stat
    $scope.stats.latestKey = $scope.key.invoke;
  }

  $scope.getSpell1CssClass = function () {
    return $scope.getSpellCssClass(0);
  }

  $scope.getSpell2CssClass = function () {
    return $scope.getSpellCssClass(1);
  }

  $scope.validateSkill1 = function () {
    $scope.validateSkill($scope.invokedSkills[0]);

    // update stat
    $scope.stats.latestKey = $scope.key.spell1;
  }

  $scope.validateSkill2 = function () {
    $scope.validateSkill($scope.invokedSkills[1]);

    // update stat
    $scope.stats.latestKey = $scope.key.spell2;
  }

  $scope.resetGame = function () {
    $log.log('statService.reset()', statService.reset());
    $scope.stats = statService.reset();
    $scope.invokedSkills = [null, null];
    $scope.invokedOrbs = ['', '', ''];

    $scope.setTargetedSkill();
  }

  /*================================================================ PUBLIC - KEY BINDING
  */

  hotkeys.add({
    combo: $scope.key.quas,
    description: 'press ' + $scope.key.quas,
    callback: function() {
      $scope.updateKeyPress($scope.key.quas);
    }
  });

  hotkeys.add({
    combo: $scope.key.wex,
    description: 'press ' + $scope.key.wex,
    callback: function() {
      $scope.updateKeyPress($scope.key.wex);
    }
  });

  hotkeys.add({
    combo: $scope.key.exort,
    description: 'press ' + $scope.key.exort,
    callback: function() {
      $scope.updateKeyPress($scope.key.exort);
    }
  });

  hotkeys.add({
    combo: $scope.key.invoke,
    description: 'press ' + $scope.key.invoke,
    callback: function() {
      $scope.invokeSkill();
    }
  });

  hotkeys.add({
    combo: $scope.key.spell1,
    description: 'press ' + $scope.key.spell1,
    callback: function() {
      $scope.validateSkill1();
    }
  });

  hotkeys.add({
    combo: $scope.key.spell2,
    description: 'press ' + $scope.key.spell2,
    callback: function() {
      $scope.validateSkill2();
    }
  });
}]);

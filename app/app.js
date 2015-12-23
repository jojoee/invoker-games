'use strict';

var appName = 'invoApp';

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

/*================================================================
  #FACTORY
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
      get: function () {
        return $http.get(skillJsonPath);
      }
    };
  }
}

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
    get: function () {
      return stats;
    },
    reset: function () {
      return startedStats;
    }
  }
}

/*================================================================
  #CONTROLLER
  ================================================================*/

angular
  .module(appName)
  .controller('MainController', MainController);

MainController.$inject = [
  '$scope', '$http', '$log', // angular core
  'localStorageService', 'hotkeys', // third party
  'appConstant', 'skillService', 'keyValue', 'statService' // app
];

function MainController($scope, $http, $log, localStorageService, hotkeys, appConstant, skillService, keyValue, statService) {
  var imgPath = appConstant.imgPath;
  var appSkillDataName = appConstant.appSkillDataName;

  var vm = this;

  // gameStage
  // - start
  // - over
  vm.gameStage = 'start'; // unused
  vm.key = keyValue;
  vm.stats = statService.get();
  vm.invokedOrbs = ['', '', '']; // starter key pressed
  vm.skills = localStorageService.get(appSkillDataName); // null
  vm.nSkill = 0;
  vm.targetedSkill = null;
  vm.invokedSkills = [null, null]; // only 2 skills

  /* ================================================================ PRIVATE - HELPER
  */

  function hasNoInvokedSkill() {
    return vm.invokedSkills[0] === null;
  }

  // unused
  function hasOneInvokedSkill() {
    if (vm.invokedSkills[0] !== null &&
      vm.invokedSkills[1] === null) {
      return true;

    } else {
      return false;
    }
  }

  function updateNPressedPerSkill() {
    if (vm.stats.nSkillInvoked > 0) {
      vm.stats.nPressedPerSkill = vm.stats.nPressed / vm.stats.nSkillInvoked;
    }
  }

  function updateNPressedPerTargetedSkill() {
    if (vm.stats.nTargetedSkillInvoked > 0) {
      vm.stats.nPressedPerTargetedSkill = vm.stats.nPressed / vm.stats.nTargetedSkillInvoked;
    }
  }

  function getTargetedSkill() {
    var randomSkillIdx = _.random(0, vm.nSkill - 1);
    var randomSkill = vm.skills[randomSkillIdx];
    var randomSkillKey = randomSkill.key;

    // first generate targeted skill (no invoked skill)
    if (hasNoInvokedSkill()) {
      return randomSkill;

    // has one invoked skill and
    // otherwise
    } else {
      if (randomSkill.key === vm.invokedSkills[0].key) {
        $log.log('generated skill is duplicate with latest invoked skill, it will generate new one');

        return getTargetedSkill();
        
      } else {
        return randomSkill
      }
    }

    return randomSkill;
  }

  function updateInvokedSkills(skill) {
    // first invoked skill
    if (hasNoInvokedSkill()) {
      vm.invokedSkills[0] = skill;

    // second invoked skill and
    // otherwise
    } else {
      vm.invokedSkills[1] = vm.invokedSkills[0];
      vm.invokedSkills[0] = skill;
    }
  }

  function orderAllSkillOrbs() {
    angular.forEach(vm.skills, function (val, key) {
      vm.skills[key].orbs = _.sortBy(val.orbs);
    });
  }

  function initSkillData() {
    if (! vm.skills) {
      $log.log('not found skill\'s data in local storage');

      skillService.get().then(function (res) {
        var skills = res.data;
        var skillsJson = angular.toJson(skills);

        vm.skills = skills
        vm.nSkill = vm.skills.length;

        setTargetedSkill();
        orderAllSkillOrbs();

        localStorageService.set(appSkillDataName, skillsJson); // save skill's data into local storage
      });

    } else {

      vm.skills = JSON.parse(vm.skills);
      vm.nSkill = vm.skills.length;

      setTargetedSkill();
      orderAllSkillOrbs();
    }

    $log.debug('vm.skills', vm.skills);
    $log.debug('vm.nSkill', vm.nSkill);
  }

  function setTargetedSkill() {
    vm.targetedSkill = getTargetedSkill();

    $log.debug('vm.targetedSkill', vm.targetedSkill);
  }

  // have to order it first
  // compare one deeped array only
  // 
  // http://stackoverflow.com/questions/28947253/sort-array-with-lodash-by-value-integer
  // http://stackoverflow.com/questions/29951293/using-lodash-to-compare-arrays
  function isSameOrbArr(orderedArr1, orderedArr2) {
    return _.isEqual(orderedArr1, orderedArr2);
  }

  function getSpellCssClass(idx) {
    var skill = vm.invokedSkills[idx];
    var cssClass = (skill) ? vm.getSkillCssClass(skill.key) : '';

    return cssClass;
  }

  function validateSkill(invokedSkill) {
    if (invokedSkill) {
      if (invokedSkill.key === vm.targetedSkill.key) {
        $log.log('valid skill');

        // generate new targeted skill
        setTargetedSkill();

        // update stat
        vm.stats.nStage++;
        vm.stats.nTargetedSkillInvoked++;
        updateNPressedPerTargetedSkill();

      } else {
        $log.log('not valid skill');
      }
    }
  }

  /* ================================================================ PUBLIC - HELPER & INIT
  */
  
  // unused
  vm.getSkillImgPath = function (fileName) {
    return imgPath + '/' + fileName;
  };

  vm.getSkillCssClass = function (skillKey) {
    return 'skill-' + skillKey;
  };

  vm.getOrbClass = function (orb) {
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

  vm.getSpell1CssClass = function () {
    return getSpellCssClass(0);
  }

  vm.getSpell2CssClass = function () {
    return getSpellCssClass(1);
  }

  vm.init = function () {
    initSkillData();
  }

  /* ================================================================ PUBLIC - EVENT
  */

  vm.updateKeyPress = function (key) {
    // update invoked orbs
    vm.invokedOrbs.shift(); // remove zero index
    vm.invokedOrbs.push(key); // add new key

    // update stat
    vm.stats.nPressed++;
    vm.stats.latestKey = key;
    updateNPressedPerSkill();
  }

  vm.invokeSkill = function () {
    var loopFlag = true;
    var invokedSkill = null;
    var invokedOrbs = _.sortBy(vm.invokedOrbs);

    angular.forEach(vm.skills, function (skill, key) {
      if (loopFlag) {
        if (isSameOrbArr(invokedOrbs, skill.orbs)) {
          invokedSkill = skill;
          loopFlag = false; // break
        }
      }
    });

    var invokedSkill1Key = (vm.invokedSkills[0]) ? vm.invokedSkills[0].key : '';
    var invokedSkill2Key = (vm.invokedSkills[1]) ? vm.invokedSkills[0].key : '';

    if (invokedSkill && invokedSkill.key) {
      if (invokedSkill.key !== invokedSkill1Key &&
        invokedSkill.key !== invokedSkill2Key) {
        $log.log('valid orbs');

        // update invoked skill
        updateInvokedSkills(invokedSkill);

        // update stat
        vm.stats.nSkillInvoked++;
        updateNPressedPerSkill();

      } else {
        $log.log('skill already invoked');
      }
      
    } else {
      // impossible
      $log.log('not valid orbs');
    }

    // update stat
    vm.stats.latestKey = vm.key.invoke;
  }

  vm.validateSkill1 = function () {
    validateSkill(vm.invokedSkills[0]);

    // update stat
    vm.stats.latestKey = vm.key.spell1;
  }

  vm.validateSkill2 = function () {
    validateSkill(vm.invokedSkills[1]);

    // update stat
    vm.stats.latestKey = vm.key.spell2;
  }

  vm.resetGame = function () {
    $log.log('statService.reset()', statService.reset());
    vm.stats = statService.reset();
    vm.invokedSkills = [null, null];
    vm.invokedOrbs = ['', '', ''];

    setTargetedSkill();
  }

  /*================================================================ PUBLIC - KEY BINDING
  */

  hotkeys.add({
    combo: vm.key.quas,
    description: 'press ' + vm.key.quas,
    callback: function() {
      vm.updateKeyPress(vm.key.quas);
    }
  });

  hotkeys.add({
    combo: vm.key.wex,
    description: 'press ' + vm.key.wex,
    callback: function() {
      vm.updateKeyPress(vm.key.wex);
    }
  });

  hotkeys.add({
    combo: vm.key.exort,
    description: 'press ' + vm.key.exort,
    callback: function() {
      vm.updateKeyPress(vm.key.exort);
    }
  });

  hotkeys.add({
    combo: vm.key.invoke,
    description: 'press ' + vm.key.invoke,
    callback: function() {
      vm.invokeSkill();
    }
  });

  hotkeys.add({
    combo: vm.key.spell1,
    description: 'press ' + vm.key.spell1,
    callback: function() {
      vm.validateSkill1();
    }
  });

  hotkeys.add({
    combo: vm.key.spell2,
    description: 'press ' + vm.key.spell2,
    callback: function() {
      vm.validateSkill2();
    }
  });
}

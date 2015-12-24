'use strict';

/*================================================================
  #MAIN
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

  // private - helper
  vm.hasNoInvokedSkill = hasNoInvokedSkill;
  vm.hasOneInvokedSkill = hasOneInvokedSkill;
  vm.updateNPressedPerSkill = updateNPressedPerSkill;
  vm.updateNPressedPerTargetedSkill = updateNPressedPerTargetedSkill;
  vm.getTargetedSkill = getTargetedSkill;
  vm.updateInvokedSkills = updateInvokedSkills;
  vm.orderAllSkillOrbs = orderAllSkillOrbs;
  vm.initSkillData = initSkillData;
  vm.setTargetedSkill = setTargetedSkill;
  vm.isSameOrbArr = isSameOrbArr;
  vm.getSpellCssClass = getSpellCssClass;
  vm.validateSkill = validateSkill;

  // public - helper & init
  vm.getSkillImgPath = getSkillImgPath
  vm.getSkillCssClass = getSkillCssClass;
  vm.getOrbClass = getOrbClass;
  vm.getSpell1CssClass = getSpell1CssClass;  
  vm.getSpell2CssClass = getSpell2CssClass;
  vm.init = init;

  // public - event
  vm.updateKeyPress = updateKeyPress;
  vm.invokeSkill = invokeSkill;
  vm.validateSkill1 = validateSkill1;
  vm.validateSkill2 = validateSkill2;
  vm.resetGame = resetGame;

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
  function getSkillImgPath(fileName) {
    return imgPath + '/' + fileName;
  };

  function getSkillCssClass(skillKey) {
    return 'skill-' + skillKey;
  };

  function getOrbClass(orb) {
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

  function getSpell1CssClass() {
    return getSpellCssClass(0);
  }

  function getSpell2CssClass() {
    return getSpellCssClass(1);
  }

  function init() {
    initSkillData();
  }

  /* ================================================================ PUBLIC - EVENT
  */

  function updateKeyPress(key) {
    // update invoked orbs
    vm.invokedOrbs.shift(); // remove zero index
    vm.invokedOrbs.push(key); // add new key

    // update stat
    vm.stats.nPressed++;
    vm.stats.latestKey = key;
    updateNPressedPerSkill();
  }

  function invokeSkill() {
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

  function validateSkill1() {
    validateSkill(vm.invokedSkills[0]);

    // update stat
    vm.stats.latestKey = vm.key.spell1;
  }

  function validateSkill2() {
    validateSkill(vm.invokedSkills[1]);

    // update stat
    vm.stats.latestKey = vm.key.spell2;
  }

  function resetGame() {
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

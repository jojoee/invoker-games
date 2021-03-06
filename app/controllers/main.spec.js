'use strict';

describe('Controllers: MainController', function() {
  var scope;
  var vm;

  var skillService;
  var $httpBackend;
  var $rootScope;
  var authRequestHandler; // unused
  var appConstant;

  beforeEach(angular.mock.module(appName));

  beforeEach(inject(function($rootScope, $controller, _$httpBackend_, _skillService_, _appConstant_) {
    $httpBackend = _$httpBackend_;
    scope = $rootScope.$new(); // unused
    vm = $controller('MainController', {
      $scope: scope // unused
    });
    skillService = _skillService_;
    appConstant = _appConstant_;
  }));

  describe('Methods', function() {
    it('all', function() {
      expect(vm.gameStage).to.be.equal('start');

      // vm.key = keyValue;
      // vm.stats = statService.get();    
      
      expect(vm.invokedOrbs).to.have.length(3);
      for (var i = vm.invokedOrbs.length - 1; i >= 0; i--) {
        expect(vm.invokedOrbs[i]).to.be.empty;
      };

      expect(vm.nSkill).to.be.equal(0);
      expect(vm.targetedSkill).to.be.null;
      var skillJsonPath = appConstant.skillJsonPath; 
      $httpBackend.when('GET', skillJsonPath).respond(200, 
        '[{"key":"cold-snap","name":"Cold Snap","orbs":["q","q","q"]},{"key":"ghost-walk","name":"Ghost Walk","orbs":["q","q","w"]},{"key":"ice-wall","name":"Ice Wall","orbs":["q","q","e"]},{"key":"emp","name":"EMP","orbs":["w","w","w"]},{"key":"tornado","name":"Tornado","orbs":["w","w","q"]},{"key":"alacrity","name":"Alacrity","orbs":["w","w","e"]},{"key":"sun-strike","name":"Sun Strike","orbs":["e","e","e"]},{"key":"forge-spirit","name":"Forge Spirit","orbs":["e","e","q"]},{"key":"chaos-meteor","name":"Chaos Meteor","orbs":["e","e","w"]},{"key":"deafening-blast","name":"Deafening Blast","orbs":["q","w","e"]}]'
      );

      // vm.init();
      skillService.get()
        .success(function(data, status, headers, config) {
          vm.skills = data;
          vm.nSkill = vm.skills.length;

          vm.setTargetedSkill();
          vm.orderAllSkillOrbs();
        });      
      $httpBackend.flush();

      expect(vm.skills).not.to.be.null;
      expect(vm.nSkill).to.be.equal(10);
      expect(vm.targetedSkill).not.to.be.null;

      expect(vm.invokedSkills).to.have.length(2);
      for (var i = vm.invokedSkills.length - 1; i >= 0; i--) {
        expect(vm.invokedSkills[i]).to.be.a('null');
      };

      expect(vm.hasNoInvokedSkill()).to.be.true;

      vm.invokedSkills[0] = 'ice-wall';
      expect(vm.hasNoInvokedSkill()).to.be.false;
      vm.invokedSkills[1] = 'emp';
      expect(vm.hasNoInvokedSkill()).to.be.false;

      vm.invokedSkills = [null, null];
      expect(vm.hasOneInvokedSkill()).to.be.false;

      vm.invokedSkills = ['emp', null];
      expect(vm.hasOneInvokedSkill()).to.be.true;

      vm.invokedSkills = [null, 'emp'];
      expect(vm.hasOneInvokedSkill()).to.be.false;

      vm.invokedSkills = ['ice-wall', 'emp'];
      expect(vm.hasOneInvokedSkill()).to.be.false;

      // vm.updateNPressedPerSkill = updateNPressedPerSkill;
      // vm.updateNPressedPerTargetedSkill = updateNPressedPerTargetedSkill;
      // vm.getTargetedSkill = getTargetedSkill;

      // first invoke
      vm.invokedSkills = [null, null];
      vm.updateInvokedSkills('emp')
      expect(vm.invokedSkills[0]).to.be.equal('emp');

      // second invoke
      vm.updateInvokedSkills('ice-wall')
      expect(vm.invokedSkills[1]).to.be.equal('emp');
      expect(vm.invokedSkills[0]).to.be.equal('ice-wall');

      vm.updateInvokedSkills('sun-strike');
      expect(vm.invokedSkills[1]).to.be.equal('ice-wall');
      expect(vm.invokedSkills[0]).to.be.equal('sun-strike');

      // vm.orderAllSkillOrbs = orderAllSkillOrbs;
      // vm.initSkillData = initSkillData;
      // vm.setTargetedSkill = setTargetedSkill;

      var orbs1 = ['q', 'w', 'e'];
      var orbs2 = ['q', 'w', 'e'];
      var orbs3 = ['e', 'w', 'q'];
      var orbs4 = ['q', 'e', 'w'];
      expect(vm.isSameOrbArr(orbs1, orbs1)).to.be.true;
      expect(vm.isSameOrbArr(orbs1, orbs2)).to.be.true;
      expect(vm.isSameOrbArr(orbs1, orbs3)).to.be.false;
      expect(vm.isSameOrbArr(orbs1, orbs4)).to.be.false;
      expect(vm.isSameOrbArr(orbs2, orbs3)).to.be.false;
      expect(vm.isSameOrbArr(orbs2, orbs4)).to.be.false;
      expect(vm.isSameOrbArr(orbs3, orbs4)).to.be.false;

      // vm.getSpellCssClass = getSpellCssClass;
      // vm.validateSkill = validateSkill;

      expect(vm.getSkillImgPath('skill-emp.png')).to.be.equal('img/skill-emp.png');
      expect(vm.getSkillImgPath('skill-ice-wall.png')).to.be.equal('img/skill-ice-wall.png');

      expect(vm.getSkillCssClass('ice-wall')).to.be.equal('skill-ice-wall');
      expect(vm.getSkillCssClass('tornado')).to.be.equal('skill-tornado');

      expect(vm.getOrbClass('q')).to.be.equal('orb-quas');
      expect(vm.getOrbClass('w')).to.be.equal('orb-wex');
      expect(vm.getOrbClass('e')).to.be.equal('orb-exort');
      expect(vm.getOrbClass('a')).to.be.equal('orb-quas');
      expect(vm.getOrbClass()).to.be.equal('orb-quas');
      expect(vm.getOrbClass(true)).to.be.equal('orb-quas');

      // vm.getSpell1CssClass = getSpell1CssClass;  
      // vm.getSpell2CssClass = getSpell2CssClass;
      // vm.init = init;

      // vm.updateKeyPress = updateKeyPress; // lazy to write test

      // vm.invokeSkill = invokeSkill;
      // vm.validateSkill1 = validateSkill1;
      // vm.validateSkill2 = validateSkill2;

      // vm.resetGame = resetGame; // lazy to write test
    });
  });
});

'use strict';

// http://stackoverflow.com/questions/16976904/javascript-counting-number-of-objects-in-object
function compareStats(stat1, stat2) {
  expect(_.size(stat1)).to.equal(8);
  expect(_.size(stat2)).to.equal(8);

  expect(stat1.nPressed).to.equal(stat2.nPressed);
  expect(stat1.nSkillInvoked).to.equal(stat2.nSkillInvoked);
  expect(stat1.nTargetedSkillInvoked).to.equal(stat2.nTargetedSkillInvoked);
  expect(stat1.nCombination).to.equal(stat2.nCombination);
  expect(stat1.nStage).to.equal(stat2.nStage);
  expect(stat1.nPressedPerSkill).to.equal(stat2.nPressedPerSkill);
  expect(stat1.nPressedPerTargetedSkill).to.equal(stat2.nPressedPerTargetedSkill);
  expect(stat1.latestKey).to.equal(stat2.latestKey);
}

describe('Services: statService', function() {
  beforeEach(angular.mock.module(appName));

  var statService = null;
  var stats = null;
  var startedStats = null;

  beforeEach(inject(function(_statService_) {
    statService = _statService_;

    stats = statService.get();
    startedStats = statService.reset();
  }));

  describe('Methods', function() {
    it('get', function() {;
      compareStats(stats, startedStats);
    });    

    it('reset', function() {
      // when game running,
      // stats will be changed
      stats.nPressed = 10;
      stats.nSkillInvoked = 20;
      stats.nTargetedSkillInvoked = 2;
      stats.nCombination = 3
      stats.nStage = 4;
      stats.nPressedPerSkill = 5;
      stats.nPressedPerTargetedSkill = 6;
      stats.latestKey = 'q';

      compareStats(stats, statService.get());
      compareStats(startedStats, statService.reset());
    });
  });
});

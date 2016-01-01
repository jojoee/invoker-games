'use strict';

// no test
describe('Services: skillService', function() {
  beforeEach(angular.mock.module(appName));

  var $httpBackend;
  var $rootScope; // unused
  var createController; // unused
  var authRequestHandler; // unused
  var skillService;
  var appConstant;

  beforeEach(inject(function(_skillService_, _$httpBackend_, _appConstant_) {
    skillService = _skillService_;

    $httpBackend = _$httpBackend_;
    appConstant = _appConstant_;
  }));

  describe('Methods', function() {
    it('get', inject(function($http) {
      var skillJsonPath = appConstant.skillJsonPath;
      var skills = null;
    }));
  });
});

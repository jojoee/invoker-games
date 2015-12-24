'use strict';

describe('Modules: invoApp', function() {
  var module = null;
  beforeEach(function() {
    module = angular.module(appName)
  });

  it('Should be registered', function() {
    expect(module).not.to.equal(null);
  });

  describe('Dependencies:', function() {
    var deps;
    var hasModule = function(m) {
      return deps.indexOf(m) >= 0;
    };
    before(function(){
      deps = module.value(appName).requires;
    });

    it('Should have a dependency', function() {
      expect(hasModule('ngRoute')).to.equal(true);
      expect(hasModule('LocalStorageModule')).to.equal(true);
      expect(hasModule('cfp.hotkeys')).to.equal(true);
    });
  });
});

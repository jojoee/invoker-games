module.exports = function (config) {
  config.set({
    basePath: './',
    // frameworks: ['jasmine'],
    // frameworks: ['jasmine', 'chai'],
    // frameworks: ['mocha'],
    // frameworks: ['mocha', 'chai'],
    frameworks: ['mocha', 'sinon-chai'],
    files: [
      'app/components/lodash/lodash.min.js',

      'app/components/angular/angular.js',
      'app/components/angular-route/angular-route.js',
      'app/components/angular-mocks/angular-mocks.js',
      'app/components/angular-local-storage/dist/angular-local-storage.min.js',
      'app/components/angular-hotkeys/build/hotkeys.min.js',

      'app/app.js',
      'app/services/*.js',
      'app/controllers/*.js',
    ],
    exclude: [],
    reporters: ['progress', 'junit'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    captureTimeout: 60000,
    browsers: ['PhantomJS'],
    // browsers: ['Chrome'],
    plugins: [
      'karma-phantomjs-launcher',
      'karma-chrome-launcher',
      // 'karma-jasmine',
      'karma-mocha',
      'karma-sinon-chai'
    ],
    junitReporter: {
      outputDir: 'test',
      outputFile: 'unit.xml',
      suite: '',
      useBrowserName: true
    },
    singleRun: false
  });
};

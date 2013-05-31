'use strict';

var grunt = require('grunt');

exports.nodeunit = {
  please_work: function(test) {
    test.expect(1);
    test.ok(true, 'this had better work.');
    test.done();
  }
};

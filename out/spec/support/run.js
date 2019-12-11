'use strict';

var _jasmine = require('jasmine');

var _jasmine2 = _interopRequireDefault(_jasmine);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// eslint-disable-line

const jas = new _jasmine2.default();
jas.loadConfigFile('src/spec/support/jasmine.json');
jas.execute();
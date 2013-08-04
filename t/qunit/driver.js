var QUnit    = require('qunitjs');
var qunitTap = require('qunit-tap').qunitTap;

qunitTap(QUnit, console.log.bind(console));
QUnit.init();
QUnit.config.updateRate = 0;

('test ok equal notEqual deepEqual notDeepEqual strictEqual notStrictEqual' +
' throws asyncTest start stop').split(' ').forEach(function (keyword) {
    global[keyword] = QUnit[keyword];
});

module.exports.QUnit = QUnit;

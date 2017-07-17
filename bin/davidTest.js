var david     = require('david');
var columnify = require('columnify')
var manifest  = require('../package.json');

david.getDependencies(manifest, function (er, deps) {
  console.log('latest dependencies information for', manifest.name);
  listDependencies(deps);
});

david.getDependencies(manifest, { dev: true }, function (er, deps) {
  console.log('latest devDependencies information for', manifest.name);
  listDependencies(deps);
});

david.getUpdatedDependencies(manifest, function (er, deps) {
  console.log('dependencies with newer versions for', manifest.name);
  listDependencies(deps);
});

david.getUpdatedDependencies(manifest, { dev: true }, function (er, deps) {
  console.log('devDependencies with newer versions for', manifest.name);
  listDependencies(deps);
});

david.getUpdatedDependencies(manifest, { stable: true }, function (er, deps) {
  console.log('dependencies with newer STABLE versions for', manifest.name);
  listDependencies(deps);
});

david.getUpdatedDependencies(manifest, { dev: true, stable: true }, function (er, deps) {
  console.log('devDependencies with newer STABLE versions for', manifest.name);
  listDependencies(deps);
});

function listDependencies(deps) {

  var data = []

  Object.keys(deps).forEach(function(depName) {
    this.push({
      name:     depName,
      required: deps[depName].required || '*',
      stable:   deps[depName].stable || 'None',
      latest:   deps[depName].latest

    })
  }.bind(data));

  var columns = columnify(data, {
    columns: ['name','required', 'stable', 'latest']
  });

  console.log(columns);
  console.log('-----------------------------------');

}

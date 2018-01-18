// client pour tester l'API REST
var restify = require('restify-clients');
var masync = require('async');
var assert = require('assert');

var client = restify.createJsonClient({
  url: 'http://0.0.0.0:3000'
});

// a test DT to CREATE (POST) READ (GET)
var testDT = {
  applicant: "paul",
  work: "PC update"
};

// a test DT to UPDATE (PUT)
var updDT = {
  applicant: "paul",
  work: "PC reinstall"
};

var pierreWR = {
  applicant: "pierre",
  work: "PC configuration"
}

function DTEquals(p1, p2) {
  for (var n in p1) {
    assert.equal(p1[n], p2[n]);
  }
}

console.log('Client start')

var dt_id = null,
  pierreWR_id =null

masync.series([
  // creation d'une DT
  function(callback) {
    client.post('/api/dt', testDT, function(err, req, res, result) {
      assert.ifError(err);
      console.log('post %j', result);
      assert.equal(result.success,true,'Echec post')
      dt_id = result.data.id
      DTEquals(testDT, result.data);
      callback(null, 'one');
    })
  },
  // obtention d'une DT avec son identifiant
  function(callback) {
    client.get('/api/dt/'+ dt_id, function(err, req, res, result) {
      assert.ifError(err);
      assert.equal(result.success,true,'Echec get')
      console.log('get %j', result);
      DTEquals(testDT, result.data);
      callback(null, 'two');
    })
  },
  // modification d'une DT (changement de description)
  function(callback) {
    client.put('/api/dt/'+ dt_id, {
      "work": "PC reinstall"
    }, function(err, req, res, result) {
      assert.ifError(err);
      assert.equal(result.success,true,'Echec put (work)')
      console.log('put %j', result);
      DTEquals(updDT, result.data);
      callback(null, 'three');
    })
  },
  // modification d'une DT (cloture)
  function(callback) {
    client.put('/api/dt/'+ dt_id, {
      "state": "closed"
    }, function(err, req, res, result) {
      assert.ifError(err);
      assert.equal(result.success,true,'Echec put (state)')
      console.log('put %j', result);
      assert.equal(result.data.state,'closed')
      callback(null, 'three');
    })
  },
  // tentative de modification d'une DT (echec car deja cloturée)
  function(callback) {
    client.put('/api/dt/'+ dt_id, {
      "work": "PC destruction"
    }, function(err, req, res, result) {
      assert.ifError(err);
      assert.equal(result.success,false,'Echec put (work2)')
      console.log('put %j', result);
      assert.equal(result.msg,'work request is already closed')
      callback(null, 'four');
    })
  },

  // tentative de suppression d'une DT (echec car deja cloturee)
  function(callback) {
    client.del('/api/dt/' + dt_id, (err, req, res, result) => {
      assert.ifError(err)
      assert.equal(result.success, false, 'Echec del (work)')
      console.log('del %j', result)
      assert.equal(result.msg,'You can\'t delete a work request which is already closed')
      callback(null,'five')
    })
  }
]);

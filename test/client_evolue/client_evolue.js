'use strict'

const Code = require('code');
const Lab = require('lab');
const Restify = require('restify-clients');

const expect = Code.expect;
const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;

const client = Restify.createJsonClient({
  url: 'http://localhost:3000'
});

// test data...
let paulWR = {
  applicant: "paul",
  work: "PC update"
};

let pierreWR = {
  applicant: "pierre",
  work: "PC configuration"
};

let henriWR = {
  applicant: "henry",
  work: "Hard disk installation"
};

let jacquesWR = {
  applicant: "jacques",
  work: "PC installation"
};

describe('app work request', () => {

  it('create', (done) => {
    client.post('/api/dt', paulWR, (err, req, res, result) => {
      if (err) return done(err);
      expect(result.success).to.be.true();
      // pour la creation c'est include car des champs sont ajoutes
      expect(result.data).to.include(paulWR);
      // tester si id a ete cree...
      expect(result.data.state).to.be.equals('opened');
      paulWR = result.data;
      done()
    })
  })

  it('get w/ id', (done) => {
    client.get('/api/dt/' + paulWR.id, (err, req, res, result) => {
      if (err) return done(err);
      expect(result.success).to.be.true();
      expect(result.data).to.be.equals(paulWR);
      done()
    })
  })

  it('update work item', (done) => {
    client.put('/api/dt/' + paulWR.id, {"work": "PC reinstall"}, (err, req, res, result) => {
      if (err) return done(err)
      expect(result.success).to.be.true();
      paulWR.work = 'PC reinstall';
      expect(result.data).to.be.equals(paulWR);
      done()
    })
  })

  it('update state (closing)', (done) => {
    client.put('/api/dt/' + paulWR.id, {"state": "closed"}, (err, req, res, result) => {
      if (err) return done(err);
      expect(result.success).to.be.true();
      paulWR.state = 'closed';
      expect(result.data).to.be.equals(paulWR);
      done()
    })
  })

  it('attempt to update a closed wr', (done) => {
    client.put('/api/dt/' + paulWR.id, {"work": "PC reinstall"}, (err, req, res, result) => {
      if (err) return done(err);
      expect(result.success).to.be.false();
      expect(result.msg).to.be.equals('wr is already closed');
      done()
    })
  })

  it('attempt to delete a closed wr', (done) => {
    client.del('/api/dt/' + paulWR.id, (err, req, res, result) => {
      if (err) return done(err);
      expect(result.success).to.be.false();
      expect(result.msg).to.be.equals('wr is already closed');
      done()
    })
  })

  it('create again', (done) => {
    client.post('/api/dt', pierreWR, (err, req, res, result) => {
      if (err) return done(err);
      expect(result.success).to.be.true();
      expect(result.data).to.include(pierreWR);
      pierreWR = result.data;
      done()
    })
  })

  it('get all WR (w/o id)', (done) => {
    client.get('/api/dt', (err, req, res, result) => {
      if (err) return done(err);
      expect(result.success).to.be.true();
      expect(result.data).to.include([paulWR, pierreWR]);
      done()
    })
  })

  it('delete an opened wr', (done) => {
    client.del('/api/dt/' + pierreWR.id, (err, req, res, result) => {
      if (err) return done(err);
      expect(result.success).to.be.true();
      //console.log("delete = ", result.dt, pierreWR);
      expect(result.data).to.be.equals(pierreWR);
      done()
    })
  })

  it('attempt to update a dummy wr', (done) => {
    client.put('/api/dt/_______', {}, (err, req, res, result) => {
      if (err) return done(err);
      expect(result.success).to.be.false();
      expect(result.msg).to.be.equals('wr not found');
      done()
    })
  })

  it('attempt to update a wr w/o id', (done) => {
    client.put('/api/dt', {}, (err, req, res, result) => {
      if (err) return done(err);
      expect(result.success).to.be.false();
      expect(result.msg).to.be.equals('wr id not provided');
      done()
    })
  })

  it('attempt to delete a dummy wr', (done) => {
    client.del('/api/dt/_______', (err, req, res, result) => {
      if (err) return done(err);
      expect(result.success).to.be.false();
      expect(result.msg).to.be.equals('wr not found');
      done()
    })
  })

  it('get global stats', (done) => {
    client.get('/api/stats', (err, req, res, result) => {
      if (err) return done(err);
      expect(result.success).to.be.true();
      expect(result.data.global_stats_wr_created).to.be.equals(2);
      expect(result.data.global_stats_wr_opened).to.be.equals(0);
      expect(result.data.global_stats_wr_closed).to.be.equals(1);
      done()
    })
  })

  it('get user stats for ' + paulWR.applicant, (done) => {
    client.get('/api/stats/' + paulWR.applicant, (err, req, res, result) => {
      if (err) return done(err);
      expect(result.success).to.be.true();
      expect(result.data.applicant).to.be.equals(paulWR.applicant);
      expect(result.data.stats_wr_created).to.be.equals(1);
      expect(result.data.stats_wr_opened).to.be.equals(0);
      expect(result.data.stats_wr_closed).to.be.equals(1);
      done()
    })
  })

  it('create henri', (done) => {
    client.post('/api/dt', henriWR, (err, req, res, result) => {
      if (err) return done(err);
      expect(result.success).to.be.true();
      expect(result.data).to.include(henriWR);
      done()
    })
  })

  it('create jacques', (done) => {
    client.post('/api/dt', jacquesWR, (err, req, res, result) => {
      if (err) return done(err);
      expect(result.success).to.be.true();
      expect(result.data).to.include(jacquesWR);
      done()
    })
  })

  // drop all work (not closed) requests
  it('delete all wr', (done) => {
    client.del('/api/dt', (err, req, res, result) => {
      if (err) return done(err);
      expect(result.success).to.be.true();
      done()
    })
  })

  it('get global stats after reset', (done) => {
    client.get('/api/stats', (err, req, res, result) => {
      if (err) return done(err);
      expect(result.success).to.be.true();
      expect(result.data.global_stats_wr_created).to.be.equals(4);
      expect(result.data.global_stats_wr_opened).to.be.equals(0);
      expect(result.data.global_stats_wr_closed).to.be.equals(1);
      done()
    })
  })

})

var stats = []

module.exports = function stats(options) {

  this.add('role:stats,info:dt', ( msg, respond ) => {
    let dt_applicant = msg.dt.applicant

    stats[dt_applicant] = stats[dt_applicant] || []

    stats[dt_applicant]['created'] = stats[dt_applicant]['created'] || 0
    stats[dt_applicant]['opened'] = stats[dt_applicant]['opened'] || 0
    stats[dt_applicant]['closed'] = stats[dt_applicant]['closed'] || 0

    switch (msg.cmd) {
      case 'POST':
        stats[dt_applicant]['created']++
        stats[dt_applicant]['opened']++
        break;
      case 'PUT':
        if ('closed' === msg.dt.state) {
          stats[dt_applicant]['opened']--
          stats[dt_applicant]['closed']++
        }
        break;
      case 'DELETE':
        stats[dt_applicant]['created']--
        stats[dt_applicant]['opened']--
        break;
    }

    console.log(stats)
    respond()
  })

  this.add('role:stats', (msg, respond) => {
    if (msg.hasOwnProperty('applicant') && msg.applicant !== undefined) {
      if ( stats[msg.applicant] !== undefined ) {
        respond(null, {success: true, data: {
          stats_wr_created: stats[msg.applicant]['created'],
          stats_wr_opened: stats[msg.applicant]['opened'],
          stats_wr_closed: stats[msg.applicant]['closed']
        }})
      } else {
        respond({success: false, msg: 'no stats found for applicant ' + msg.applicant})
      }
    } else {
      global_stats_wr_created = 0
      global_stats_wr_opened = 0
      global_stats_wr_closed = 0

      for (let applicant in stats) {
        global_stats_wr_created += stats[applicant]['created']
        global_stats_wr_opened += stats[applicant]['opened']
        global_stats_wr_closed += stats[applicant]['closed']
      }

      respond(null, {success: true, data: {
        global_stats_wr_created: global_stats_wr_created,
        global_stats_wr_opened: global_stats_wr_opened,
        global_stats_wr_closed: global_stats_wr_closed
      }})
    }
  })
}

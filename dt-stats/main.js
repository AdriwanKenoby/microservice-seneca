var stats = {}
require('seneca')()
.add('role:stats,info:dt', ( msg, respond ) => {
	let dt_applicant = msg.dt.applicant

	stats[dt_applicant]['created'] = stats[dt_applicant]['created'] || 0
	stats[dt_applicant]['closed'] = stats[dt_applicant]['closed'] || 0

	switch (msg.cmd) {
		case 'POST':
			stats[dt_applicant]['created']++
			break;
		case 'PUT':
			if (msg.state === 'closed') {
				stats[dt_applicant]['created']--
				stats[dt_applicant]['closed']++
			}
			break;
		case 'DELETE':
			stats[dt_applicant]['created']--
			break;
	}

	console.log(stats)
	respond()
})
.listen({port:9003, pin:'role:stats,info:dt'})

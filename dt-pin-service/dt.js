module.exports = function dt(options) {

	function _getDT (objectFactory, id, respond, action) {
		objectFactory.load$(id, (err, dt) => {
			if (err) return respond({success: false, msg: err})

			if (dt) {
				if(action){
					action(dt)
				}
			} else {
				return respond({success: false, msg: 'DT not found for id ' + id})
			}
		})
	}

	this.add('role:dt,cmd:GET', (msg, respond) => {
		if (msg.hasOwnProperty('id') && msg.id !== undefined) {
			_getDT(this.make('dt'), msg.id, respond, (dt) => {
				respond(null, {success: true, data: dt.data$(false)})
			})
		} else {
			this.make('dt').list$( (err, list) => {
				if (err) return respond({success: false, msg: err})
				respond(null, { success: true , data: list.map((dt) => { return dt.data$(false) }) })
			})
		}
	})

	this.add('role:dt,cmd:POST', (msg, respond) => {
		let objectFactory = this.make('dt')
		objectFactory.state = 'created'
		objectFactory.data$(msg.data).save$( (err, dt) => {
			if (err) return respond({success: false, msg: err})

			this.act('role:stats,info:dt', {cmd: 'POST', dt:dt})
			respond(null, {success: true, data: dt.data$(false)})

		})
	})

	this.add('role:dt,cmd:PUT', (msg, respond) => {

		let objectFactory = this.make('dt')
		_getDT(objectFactory, msg.id, respond, (dt) => {
			if ('closed' === dt.state) return respond({success: false, msg: 'work request is already closed'})

			objectFactory.id = msg.id
			objectFactory.data$(msg.data).save$((err, dt) => {
				if (err) return respond({success: false, msg: err})

				this.act('role:stats,info:dt', {cmd:'PUT', dt:dt})
				respond(null, {success: true, data: dt.data$(false)})

			})
		})
	})

	this.add('role:dt,cmd:DELETE', (msg, respond) => {
		let objectFactory = this.make('dt')

		if (msg.hasOwnProperty('id') && msg.id !== undefined) {
			_getDT(objectFactory, msg.id, respond, (dt) => {
				objectFactory.remove$(msg.id, (err) => {
					if (err) return respond({success: false, msg: err})
					if (dt.state === 'closed') return respond({success: false, msg: 'You can\'t delete a work request which is already closed'})
					this.act('role:stats,info:dt', {cmd:'DELETE', dt:dt})
					respond(null, {success: true, data: dt.data$(false)})

				})
			})
		} else {

			var result = []

			objectFactory.list$( (err, list) => {
				if (err) return respond({success: false, msg: err})

				for ( let dt in list) {
					if (list[dt].state !== 'closed') {
						result.push(list[dt].data$(false))
						objectFactory.remove$(list[dt].id)
					}
				}

				respond(null, { success: true , data: result })
			})
		}

	})

}

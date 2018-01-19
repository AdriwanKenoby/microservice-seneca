module.exports = function dt(options) {

	function _getDT (objectFactory, id, respond, action) {
		objectFactory.load$(id, (err, dt) => {
			if (err) return respond({success: false, msg: err})

			if (dt) {
				if(action){
					action(dt)
				}
			} else {
				return respond({success: false, msg: 'wr not found' })
			}
		})
	}

	this.add('role:dt,cmd:GET', (msg, respond) => {
		console.log(msg)
		if (msg.hasOwnProperty('id') && msg.id !== undefined) {
			console.log('test1')
			_getDT(this.make('dt'), msg.id, respond, (dt) => {
				return respond(null, {success: true, data: dt.data$(false)})
			})
		} else {
			console.log('test2')
			this.make('dt').list$( (err, list) => {
				if (err) return respond({success: false, msg: err})
				return respond(null, { success: true , data: list.map((dt) => { return dt.data$(false) }) })
			})
		}
	})

	this.add('role:dt,cmd:POST', (msg, respond) => {
		let objectFactory = this.make('dt')
		objectFactory.state = 'created'
		objectFactory.data$(msg.data).save$( (err, dt) => {
			if (err) return respond({success: false, msg: err})

			this.act('role:stats,info:dt', {cmd: 'POST', dt:dt})
			this.act('role:engine,info:dt,cmd:index', { dt:dt })
			respond(null, {success: true, data: dt.data$(false)})

		})
	})

	this.add('role:dt,cmd:PUT', (msg, respond) => {
		if(!msg.hasOwnProperty('id')) return respond({ success: false, msg: 'wr id not provided' })
		let objectFactory = this.make('dt')
		_getDT(objectFactory, msg.id, respond, (dt) => {
			if ('closed' === dt.state) {
				return respond({success: false, msg: 'wr is already closed'})
			} else {
				objectFactory.id = msg.id
				objectFactory.data$(msg.data).save$((err, dt) => {
					if (err) return respond({success: false, msg: err})
					this.act('role:stats,info:dt', {cmd:'PUT', dt:dt})
					this.act('role:engine,info:dt,cmd:update', { dt:dt })
					respond(null, {success: true, data: dt.data$(false)})
				})
			}
		})
	})

	this.add('role:dt,cmd:DELETE', (msg, respond) => {
		let objectFactory = this.make('dt')

		if (msg.hasOwnProperty('id') && msg.id !== undefined) {
			_getDT(objectFactory, msg.id, respond, (dt) => {
				if(dt.state === 'closed') return respond({success: false, msg: 'wr is already closed'})
				objectFactory.remove$(msg.id, (err) => {
					if (err) return respond({success: false, msg: err})
					this.act('role:stats,info:dt', { cmd:'DELETE', dt: dt })
					this.act('role:engine,info:dt,cmd:delete', { dt: dt })
					return respond(null, {success: true, data: dt.data$(false)})

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
						this.act('role:stats,info:dt', { cmd:'DELETE', dt: list[dt] })
						this.act('role:engine,info:dt,cmd:delete', { dt: list[dt] })
					}
				}

				respond(null, { success: true , data: result })
			})
		}

	})

}

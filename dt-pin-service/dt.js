module.exports = function dt(options) {

	// Methode pour recuperer un object DT et appeler une fonction de callback
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

	// List l'ensemble des DT ou seulement une DT si l'id est passer dans le message
	this.add('role:dt,cmd:GET', (msg, respond) => {
		if (msg.hasOwnProperty('id') && msg.id !== undefined) {
			_getDT(this.make('dt'), msg.id, respond, (dt) => {
				return respond(null, {success: true, data: dt.data$(false)})
			})
		} else {
			this.make('dt').list$( (err, list) => {
				if (err) return respond({success: false, msg: err})
				return respond(null, { success: true , data: list.map((dt) => { return dt.data$(false) }) })
			})
		}
	})

	// creer un DT
	this.add('role:dt,cmd:POST', (msg, respond) => {
		let objectFactory = this.make('dt')
		// Quand on creer un DT le statut est forcement opened attention au test
		objectFactory.state = 'opened'
		objectFactory.data$(msg.data).save$( (err, dt) => {
			if (err) return respond({success: false, msg: err})

			// appel au microservice de gestion des statistiques
			this.act('role:stats,info:dt', {cmd: 'POST', dt:dt})
			// indexation de la DT par le microservice associe
			this.act('role:engine,info:dt,cmd:index', { dt:dt })
			respond(null, {success: true, data: dt.data$(false)})

		})
	})

	// Mise A jour d'un DT
	this.add('role:dt,cmd:PUT', (msg, respond) => {
		if(!msg.hasOwnProperty('id')) return respond({ success: false, msg: 'wr id not provided' })
		let objectFactory = this.make('dt')
		_getDT(objectFactory, msg.id, respond, (dt) => {
			// Si la DT est deje ferme on ne peut pas la mettre a jour
			if ('closed' === dt.state) {
				return respond({success: false, msg: 'wr is already closed'})
			} else {
				objectFactory.id = msg.id
				objectFactory.data$(msg.data).save$((err, dt) => {
					if (err) return respond({success: false, msg: err})
					// appel au microservice de gestion des statistiques
					this.act('role:stats,info:dt', {cmd:'PUT', dt:dt})
					// indexation de la DT par le microservice associe
					this.act('role:engine,info:dt,cmd:update', { dt:dt })
					respond(null, {success: true, data: dt.data$(false)})
				})
			}
		})
	})

	// Suppression d'une DT
	this.add('role:dt,cmd:DELETE', (msg, respond) => {
		let objectFactory = this.make('dt')

		if (msg.hasOwnProperty('id') && msg.id !== undefined) {
			_getDT(objectFactory, msg.id, respond, (dt) => {
				// On ne supprime pas les DT deja fermee
				if(dt.state === 'closed') return respond({success: false, msg: 'wr is already closed'})
				objectFactory.remove$(msg.id, (err) => {
					if (err) return respond({success: false, msg: err})
					this.act('role:stats,info:dt', { cmd:'DELETE', dt: dt })
					this.act('role:engine,info:dt,cmd:delete', { dt: dt })
					return respond(null, {success: true, data: dt.data$(false)})

				})
			})
		} else { // Si pas d'id dans le message alors on supprime toutes les DT qui ne sont pas fermee

			var result = []

			objectFactory.list$( (err, list) => {
				if (err) return respond({success: false, msg: err})

				for ( let dt in list) {
					// On ne supprime pas les DT deja fermee
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

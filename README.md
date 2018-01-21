# Project Master 2 Informatique

> L'idee generale de ce projet est de proposer une api REST afin de gérer des demandes de travaux à l'aide de la bibliotheque Seneca.

### Installation

```
cd [mon_service_directory]
npm install
node main.js
```

### Prerequisites

```
node > 8.*
```

## Présentation de l'application

Seneca fonctionne sur le concept d'échange de messages et permet de crée des architectures microservices ou chaque composant est indépendant.  
La solution développée permet de gérer une liste de demandes de travaux (DT) à partir d'une API REST à travers Seneca constitué des micro-services suivants :    
* Web-interface : Reçoit les requêtes HTTP, et les acheminent vers les microservices correspondent.  
* dt-pin-service : Réalise les opérations CRUD.   
* dt-stats : Fournit des statistiques a propos des DTs.  
* dt-search-engine : Gère un moteur d'indexation.  

### Représentation schématique de l'architecture

![Architecture](ALOS.jpg)

### Messages échangés par l'application

#### Implémentation CRUD (dt-pin-service)

| action                            | notes                                                                |
|-----------------------------------|----------------------------------------------------------------------|
| role:dt,cmd:GET                   | list all DT objects in DB                                            |
| role:dt,cmd:POST,data:\*          | create DT object with provided data                                  |
| role:dt,cmd:PUT,id:\*,data:\*     | update DT                                                            |
| role:dt,cmd:DELETE,id:\*          | delete DT, all with 'opened' state if if not provided                |

#### Gestion des statistiques (dt-stats)

| action                                       | notes                                                             |
|----------------------------------------------|-------------------------------------------------------------------|
| role:stats,info:dt,cmd:POST,applicant:\*     | increment counter for provided applicant                          |
| role:stats,info:dt,cmd:PUT,applicant:\*      | update counter for provided applicant if needed depend on DT state|
| role:stats,info:dt,cmd:DELETE,applicant:\*   | decrement counter                                                 |
| role:stats                                   | get global stats                                                  |
| role:stats,applicant:*                       | get stats for specific user                                       |

#### Gestion de l'indexation (dt-search-engine)

| action                                      | notes                                                      |
|---------------------------------------------|------------------------------------------------------------|
| role:engine,info:dt,cmd:index,dt:\*         | index dt                                                   |
| role:engine,info:dt,cmd:search,q:\*         | search by query                                            |
| role:engine,info:dt,cmd:update,dt:\*        | update index if needed                                     |
| role:engine,info:dt,cmd:delete,dt:\*        | delete an indexed value                                    |

#### Web Interface

| method    | route              | action                 | call action                                                 | notes               |
|-----------|--------------------|------------------------|-------------------------------------------------------------|---------------------|
| GET       | /api/dt/:id?       | role:api,path:dt...    | role:dt,cmd:GET,?id:\*                                      | cf. dt-pin-service  |
| POST      | /api/dt            | role:api,path:dt...    | role:dt,cmd:POST,data:{applicant:\*,work:\*,state:\*}       |         ""          |
| PUT       | /api/dt/:id        | role:api,path:dt...    | role:dt,cmd:PUT,id:\*,data:{applicant:\*,work:\*,state:\*}  |         ""          |
| DELETE    | /api/dt            | role:api,path:dt...    | role:dt,cmd:DELETE,id:\*                                    |         ""          |
| GET       | /api/stats/:user?  | role:api,path:stats... | role:stats,?applicant:user                                  | cf. dt-stats        |
| GET       | /api/engine/:query | role:api,path:engine...| role:engine,info:dt,cmd:search,q:\*                         | cf. dt-search-engine|

## Test

Pour s'assurer du bon fonctionnement de nos micro-services, plusieurs tests ont ete realises durent toutes les phases de développement.  
Package de test disponible dans le répertoire `test/` deux clients sont fournis, certaines routes ont ete changees dans le client evolue ! seuls les tests modifies sont disponible dans ce depot    

### Tests en plus :  

#### Pour l'indexation
On recherche avec le mot-cle "p" et on compare si le work du resultat est egale a "PC update" de la dt qu'on vient d'ajouter
```
it('search with a keyword', (done) => {
    client.get('/api/engine/p', (err, req, res, result) => {
      if (err) return done(err);
      expect(result.data[0].work).to.be.equals("PC update");
      done()
    })
  })
```

#### Pour la desindexation et mise a jour
Vers la fin des tests, plusieurs mises a jour et suppressions ont ete realisees, et ne reste plus q'une seule dt avec le work egale a "PC reinstall"  
Pour tester la desindexation et la mise a jour ainsi que la recherche dans n'importe quel endroit de la chaine de caractere, on a fait in test avec le mot cle "pc insta", le resultat retourne doit etre egale a un.
```
it('search with a keyword', (done) => {
    client.get('/api/engine/pc%20insta', (err, req, res, result) => {
      if (err) return done(err);
      expect(result.data.length === 1).to.be.true();
      done()
    })
  })
```

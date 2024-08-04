const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const app = express()
app.use(express.json())

const dbpath = path.join(__dirname, 'cricketTeam.db')
let db = null
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`Db error :${e.message}`)
    process.exit(1)
  }
}
initializeDBAndServer()

const converstion = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}

// Get list of book

app.get('/players/', async (request, response) => {
  const players_list = `SELECT * FROM cricket_team ORDER BY player_id;`
  const playerArray = await db.all(players_list)
  response.send(playerArray.map(eachPlayer => converstion(eachPlayer)))
})

// post method

app.post('/players/', async (request, response) => {
  const player_deatils = request.body
  const {playerName, jerseyNumber, role} = player_deatils
  const addPlayerQuary = `INSERT INTO cricket_team(player_name,jersey_number,role)
  VALUES('${playerName}',${jerseyNumber},'${role}');`
  const dbResponse = await db.run(addPlayerQuary)
  const playerId = dbResponse.lastID
  response.send('Player Added to Team')
})
// get only particuler book

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayer = `SELECT * FROM cricket_team WHERE player_id = ${playerId};`
  const player = await db.get(getPlayer)
  response.send(converstion(player))
})

// update paticular player

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const player_deatil = request.body
  const {playerName, jerseyNumber, role} = player_deatil
  const updateQuary = `UPDATE cricket_team 
  SET
    player_name = '${playerName}',
    jersey_number = ${jerseyNumber},
    role ='${role}'
    WHERE player_id = ${playerId};
  ;`
  const updated_player = await db.run(updateQuary)
  response.send('Player Details Updated')
})

// DELETE the player from table

app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deleteQuary = `
  DELETE FROM cricket_team WHERE player_id = ${playerId}`
  const deletePlayer = await db.run(deleteQuary)
  response.send('Player Removed')
})

module.exports = app

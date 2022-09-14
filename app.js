const express = require("express");

const { open } = require("sqlite");

const sqlite3 = require("sqlite3");

const path = require("path");

const dbpath = path.join(__dirname, "cricketTeam.db");

//console.log(dbpath);

const app = express();

app.use(express.json());

let db = null;

const intitializedbandserver = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server running on http://localhost:3000");
    });
  } catch (e) {
    console.log(`Message occured ${e}`);
    process.exit(1);
  }
};

intitializedbandserver();

const convertcamelCase = (obj) => {
  return {
    playerId: obj.player_id,
    playerName: obj.player_name,
    jerseyNumber: obj.jersey_number,
    role: obj.role,
  };
};

//get http request
app.get("/players/", async (request, response) => {
  const query = `SELECT * FROM cricket_team;`;
  const connectdb = await db.all(query);
  response.send(connectdb.map((eachitem) => convertcamelCase(eachitem)));
});

//post http request
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerQuery = `
    insert into 
    cricket_team(player_name, jersey_number, role)
    values(
        '${playerName}',
        ${jerseyNumber},
        '${role}'
    );`;
  const player = await db.run(addPlayerQuery);
  response.send("Player Added to Team");
});

//get http method particular id
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const query = `SELECT * FROM cricket_team WHERE player_id=${playerId}`;
  const data = await db.get(query);
  response.send(convertcamelCase(data));
});

//put http method by particular id
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const bodydetails = request.body;
  const { playerName, jerseyNumber, role } = bodydetails;
  const query = `UPDATE cricket_team SET 
    player_name='${playerName}',
    jersey_number=${jerseyNumber},
    role='${role}'
    WHERE player_id=${playerId};`;
  const data = await db.run(query);
  response.send("Player Details Updated");
});

//Delete http method by using particular id
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const query = `DELETE FROM cricket_team WHERE player_id=${playerId}`;
  await db.run(query);
  response.send("Player Removed");
});

module.exports = app;

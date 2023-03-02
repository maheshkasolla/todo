const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

let database;
const initializeDBandServer = async () => {
  try {
    database = await open({
      filename: path.join(__dirname, "todoApplication.db"),
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running on http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DataBase error is ${error.message}`);
    process.exit(1);
  }
};
initializeDBandServer();

//API 1 GET

const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};

app.get("/todos/", async (request, response) => {
  let data = null;
  let getTodosQuery = "";
  const { search_q = "", priority, status } = request.query;

  switch (true) {
    case hasPriorityAndStatusProperties(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}'
    AND priority = '${priority}';`;
      break;
    case hasPriorityProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND priority = '${priority}';`;
      break;
    case hasStatusProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}';`;
      break;
    default:
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%';`;
  }

  data = await database.all(getTodosQuery);
  response.send(data);
});

const getSingleReturnId = (requestQuery) => {
  return {
    id: requestQuery.id,
    todo: requestQuery.todo,
    priority: requestQuery.priority,
    status: requestQuery.status,
  };
};

///API 2
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodosQuery = `SELECT * FROM todo WHERE id=${todoId}`;
  const dbResponse = await database.get(getTodosQuery);
  response.send(getSingleReturnId(dbResponse));
});

///API 3
app.post("/todos/", async (request, response) => {
  const todoDetails = request.body;
  const { todo, priority, status } = todoDetails;
  const postNewTodoId = `INSERT INTO todo (todo,priority,status)
    VALUES("${todo}","${priority}","${status}")`;
  const dbResponse = await database.run(postNewTodoId);
  const lastTodoId = dbResponse.lastID;
  response.send("Todo Successfully Added");
});

///API 4
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { todo, priority, status } = request.body;
  const updateQuery = `update todo set 
  todo="${todo}"
    priority="${priority}",status="${status}"
    WHERE id=${todoId}`;
  const dbResponse = await database.run(updateQuery);
  response.send("Status Updated");
});
///API 5
app.delete("/todos/:todoId/", async (request, response) => {
  const { totoId } = request.params;
  const deleteQuery = `DELETE FROM todo WHERE id=${todoId};`;
  dbResponse = await database.run(deleteQuery);
  response.send("Todo Deleted");
});
module.exports = app;

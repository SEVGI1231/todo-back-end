import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import {
  addDummyDbItems,
  addDbItem,
  getDbItemById,
  DbItem,
  updateDbItemById,
} from "./db";
//import filePath from "./filePath";
import { v4 as uuidv4 } from "uuid";

// loading in some dummy items into the database
// (comment out if desired, or change the number)
addDummyDbItems(20);

const app = express();

/** Parses JSON data in a request automatically */
app.use(express.json());
/** To allow 'Cross-Origin Resource Sharing': https://en.wikipedia.org/wiki/Cross-origin_resource_sharing */
app.use(cors());

// read in contents of any environment variables in the .env file
dotenv.config();

// use the environment variable PORT, or 4000 as a fallback
const PORT_NUMBER = process.env.PORT ?? 4000;
export interface ToDoItem {
  message: string;
  id: string;
}
let ToDoItems: ToDoItem[] = [];

// API full list of todo

app.get("/list", (req, res) => {
  // const pathToFile = filePath("../public/index.html");
  //res.sendFile(pathToFile);
  res.json(ToDoItems);
});

//POST /list
app.post("/list", (req, res) => {
  const newToDo = req.body;
  const userId = uuidv4();
  const newToDoWithID: ToDoItem = { ...newToDo, id: userId };
  ToDoItems.push(newToDoWithID);
  res.send(newToDoWithID);
});
//GET by id
app.get("/list/:id", (req, res) => {
  const { id } = req.params;
  const specificToDo = ToDoItems.find((el) => id == el.id);
  res.json(specificToDo);
});
//DELETE by id
app.delete("/list/:id", (req, res) => {
  const { id } = req.params;
  ToDoItems = ToDoItems.filter((el) => el.id !== id);
  res.json(ToDoItems);
});
//PATCH by id
app.patch("/list/:id", (req, res) => {
  const { id } = req.params;
  const { message } = req.body;
  const itemToBeUpdated = ToDoItems.find((el) => el.id === id);
  if (itemToBeUpdated) {
    itemToBeUpdated.message = message;
  }
  res.json(ToDoItems);
});
//-------//

// POST /items
app.post<{}, {}, DbItem>("/items", (req, res) => {
  // to be rigorous, ought to handle non-conforming request bodies
  // ... but omitting this as a simplification
  const postData = req.body;
  const createdSignature = addDbItem(postData);
  res.status(201).json(createdSignature);
});

// GET /items/:id
app.get<{ id: string }>("/items/:id", (req, res) => {
  const matchingSignature = getDbItemById(parseInt(req.params.id));
  if (matchingSignature === "not found") {
    res.status(404).json(matchingSignature);
  } else {
    res.status(200).json(matchingSignature);
  }
});

// DELETE /items/:id
app.delete<{ id: string }>("/items/:id", (req, res) => {
  const matchingSignature = getDbItemById(parseInt(req.params.id));
  if (matchingSignature === "not found") {
    res.status(404).json(matchingSignature);
  } else {
    res.status(200).json(matchingSignature);
  }
});

// PATCH /items/:id
app.patch<{ id: string }, {}, Partial<DbItem>>("/items/:id", (req, res) => {
  const matchingSignature = updateDbItemById(parseInt(req.params.id), req.body);
  if (matchingSignature === "not found") {
    res.status(404).json(matchingSignature);
  } else {
    res.status(200).json(matchingSignature);
  }
});

app.listen(PORT_NUMBER, () => {
  console.log(`Server is listening on port ${PORT_NUMBER}!`);
});

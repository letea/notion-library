import { Database } from "../../index.js";

// local files
import { config } from "../config.js";
const { auth, databaseId } = config;

const database = new Database({
  auth,
  databaseId
});

const response = await database.queryItems({
  sorts: [
    {
      property: "Name",
      direction: "ascending"
    }
  ]
});

console.log(response);

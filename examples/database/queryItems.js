import { Database } from "#letea/notion";

// local files
import { config } from "#examples/config";
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
  ],
  hasPageUrl: true
});

console.log(response);

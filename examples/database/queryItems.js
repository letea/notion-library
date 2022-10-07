const { Database } = require("#letea/notion");

// local files
const { config } = require("#examples/config");
const { auth, databaseId } = config;

(async () => {
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
    pageSize: 100,
    hasPageUrl: true
  });

  console.log(response);
})()
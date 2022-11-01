const { Database } = require("#letea/notion");

// local files
const { config } = require("#examples/config");
const { auth, databaseId } = config;

(async () => {
  const database = new Database({
    auth,
    databaseId
  });

  const response = await database.retrieve();

  console.log(response);
})();

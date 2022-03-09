import { Database } from "#letea/notion";

// local files
import { config } from "#examples/config";
const { auth, databaseId } = config;

const database = new Database({
  auth,
  databaseId
});

const types = database.getTypes();

const response = await database.addItems({
  Name: {
    type: types.title,
    value: `Title ${new Date()}`
  },
  Number: {
    type: types.number,
    value: 1.49
  },
  Text: {
    type: types.text,
    value: "This is a test"
  },
  Select: {
    type: types.select,
    value: "Select 1"
  },
  "Multi-Select": {
    type: types.multiSelect,
    value: ["select1", "select2"]
  },
  Date: {
    type: types.date,
    value: [new Date(), new Date()] // "2022-02-26"
  },
  Checkbox: {
    type: types.checkbox,
    value: true
  },
  URL: {
    type: types.url,
    value: "https://google.com"
  },
  Email: {
    type: types.email,
    value: "username@email.com"
  },
  Phone: {
    type: types.phone,
    value: "0999999999"
  }
});

console.log(response);

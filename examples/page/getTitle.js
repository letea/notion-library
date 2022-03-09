import { Page } from "#letea/notion";

// local files
import { config } from "#examples/config";
const { auth, blockId } = config;

const page = new Page({
  auth,
  blockId
});

const response = await page.getTitle();

console.log(response);

import { Page } from "../../index.js";

// local files
import { config } from "../config.js";
const { auth, blockId } = config;

const page = new Page({
  auth,
  blockId
});

const response = await page.getBlocks();

console.log(response);

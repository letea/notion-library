const { Page } = require("#letea/notion");

// local files
const { config } = require("#examples/config");
const { auth, blockId } = config;

(async () => {
  const page = new Page({
    auth,
    blockId
  });

  const response = await page.getTitle();

  console.log(response);
})()

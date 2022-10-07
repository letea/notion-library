// node modules
const { Client } = require("@notionhq/client");

class Page {
  constructor({ auth = "", blockId = "" } = {}) {
    this.notion = new Client({
      auth
    });
    this.blockId = blockId;
  }

  setBlockId(blockId = "") {
    this.blockId = blockId;
  }

  getBlockId() {
    return this.blockId;
  }

  async getTitle() {
    if (this._checkIdAndNotionIsReady()) {
      try {
        const response = await this.notion.blocks.retrieve({
          block_id: this.blockId
        });
        return response?.child_page?.title;
      } catch (error) {
        // console.log(error);
        return "";
      }
    }

    return "";
  }

  async getBlocks() {
    if (this._checkIdAndNotionIsReady()) {
      try {
        const response = await this.notion?.blocks?.children?.list({
          block_id: this.blockId
        });

        return response?.results?.map((item, index, array) =>
          this._getValue(item, index, array)
        );
      } catch (error) {
        // console.log(error);
        return [];
      }
    }

    return [];
  }

  _checkIdAndNotionIsReady() {
    return this.blockId && this.notion;
  }

  _getNumberedListItemIndex(currentIndex, array) {
    let itemIndex = 1;

    for (let index = currentIndex - 1; index >= 0; index--) {
      if (array?.[index]?.type === "numbered_list_item") {
        itemIndex += 1;
      } else {
        return itemIndex;
      }
    }

    return itemIndex;
  }

  _getValue(data = {}, index, array) {
    index === 0 && console.log(data);
    switch (data.type) {
      case "image": {
        return data?.[data?.type]?.file?.url || "";
      }
      case "unsupported": {
        return "";
      }
      case "numbered_list_item": {
        const itemIndex = this._getNumberedListItemIndex(index, array);
        const allText = this._getAllText(data?.[data.type]?.text);

        return `${itemIndex}. ${allText}`;
      }
      default: {
        return this._getAllText(data?.[data.type]?.rich_text) || "";
      }
    }
  }

  _getAllText(data = []) {
    return data.reduce((result, item) => {
      switch (item.type) {
        default: {
          const url = item?.text?.link?.url;
          const text = item?.text?.content;

          // NOTE: 處理帶有 URL 的字串
          if (url) {
            return result + `[${text}](${url})`;
          }

          return result + text;
        }
      }
    }, "");
  }
}

module.exports = { Page };

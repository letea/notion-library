// node modules
const { Client } = require("@notionhq/client");

class Database {
  constructor({ auth = "", databaseId = "" } = {}) {
    this.notion = new Client({
      auth
    });
    this.databaseId = databaseId;
  }

  setDatabaseId(databaseId = "") {
    this.databaseId = databaseId;
  }

  getDatabaseId() {
    return this.databaseId;
  }

  getTypes() {
    return {
      title: "title",
      number: "number",
      text: "rich_text",
      select: "select",
      multiSelect: "multi_select",
      date: "date",
      checkbox: "checkbox",
      url: "url",
      email: "email",
      phone: "phone_number"
    };
  }

  async addItems(properties = {}) {
    const refinedProperties = Object.keys(properties).reduce(
      (accumulator, key) => {
        const { type, value } = properties[key];
        accumulator[key] = this._setValue({ type, value });
        return accumulator;
      },
      {}
    );

    try {
      const response = await this.notion?.pages?.create({
        parent: { database_id: this.databaseId },
        properties: refinedProperties
      });

      // NOTE: Success! Entry added.
      return response;
    } catch (error) {
      console.error("Fail!", error);
    }
  }

  async queryItems({
    filter,
    sorts = [],
    hasPageUrl = false,
    pageSize = 100,
    startCursor
  } = {}) {
    const response = await this?.notion?.databases.query({
      database_id: this.databaseId,
      filter,
      sorts,
      start_cursor: startCursor,
      page_size: pageSize > 100 ? 100 : pageSize
    });

    let result = response.results.map((result) => {
      let data = {};

      if (hasPageUrl) {
        data.pageUrl = result.url;
      }

      Object.keys(result.properties).forEach((key) => {
        data[key] = this._getValue(result.properties[key]);
      });

      return data;
    });

    if (
      result.length < pageSize &&
      response?.has_more &&
      response?.next_cursor
    ) {
      const nextResult = await this.queryItems({
        filter,
        sorts,
        hasPageUrl,
        startCursor: response?.next_cursor,
        pageSize: pageSize - result.length
      });
      return [...result, ...nextResult].slice(0, pageSize);
    } else {
      return result;
    }
  }

  async retrieve() {
    const response = await this?.notion?.databases?.retrieve({
      database_id: this.databaseId
    });

    return {
      id: response?.id,
      createdTime: response?.created_time,
      lastEditedTime: response?.last_edited_time,
      title: response?.title?.[0]?.plain_text,
      url: response?.url
    };
  }

  async getInlineLastEditedTime() {
    const response = await this?.notion?.databases.query({
      database_id: this.databaseId,
      sorts: [
        {
          timestamp: "last_edited_time",
          direction: "descending"
        }
      ],
      page_size: 1
    });

    return response?.results?.[0]?.last_edited_time;
  }

  _getValue(data = {}) {
    switch (data.type) {
      case "image": {
        return data?.[data?.type]?.file?.url || "";
      }
      case "number": {
        return data?.number;
      }
      case "unsupported": {
        return "";
      }
      case "select": {
        return data?.select?.name || "";
      }
      case "multi_select": {
        return data?.multi_select?.map((item) => item.name);
      }
      case "date": {
        return {
          startDate: data?.date?.start || null,
          endDate: data?.date?.endDate || null
        };
      }
      case "people": {
        return data?.people?.map((item) => item.name);
      }
      case "files": {
        const name = data?.files?.[0]?.name;
        const url = data?.files?.[0]?.file?.url;

        if (!name || !url) {
          return null;
        }

        return {
          name: data?.files?.[0]?.name,
          url: data?.files?.[0]?.file?.url
        };
      }
      case "checkbox": {
        return data?.checkbox;
      }
      case "url": {
        return data?.url || null;
      }
      case "test": {
        return null;
      }
      case "email": {
        return data?.email || null;
      }
      case "phone_number": {
        return data?.phone_number || null;
      }
      case "formula": {
        return data?.[data.type]?.string || null;
      }
      default: {
        return data?.[data.type].reduce((accumulator, item) => {
          const content = item?.text?.content || "";
          accumulator += content;
          return accumulator;
        }, "");
      }
    }
  }

  _setValue({ type = "", value = null } = {}) {
    switch (type) {
      case "title": {
        return {
          type,
          title: [
            {
              type: "text",
              text: {
                content: value
              }
            }
          ]
        };
      }
      case "number": {
        return {
          type,
          number: value
        };
      }
      case "rich_text": {
        return {
          type,
          rich_text: [
            {
              type: "text",
              text: {
                content: value
              }
            }
          ]
        };
      }
      case "select": {
        return {
          type,
          select: {
            name: value
          }
        };
      }
      case "multi_select": {
        return {
          type,
          multi_select: value.map((item) => {
            return { name: item };
          })
        };
      }
      case "date": {
        return {
          type,
          date: Array.isArray(value)
            ? {
                start: value?.[0],
                end: value?.[1] || null
              }
            : {
                start: value,
                end: null
              }
        };
      }
      case "checkbox": {
        return {
          type,
          checkbox: value
        };
      }
      case "url": {
        return {
          type,
          url: value
        };
      }
      case "email": {
        return {
          type,
          email: value
        };
      }
      case "phone_number": {
        return {
          type,
          phone_number: value
        };
      }
    }
  }
}

module.exports = { Database };

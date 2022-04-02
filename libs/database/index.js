// node modules
import { Client } from "@notionhq/client";

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

  async queryItems({ filter, sorts = [], hasPageUrl = false } = {}) {
    const response = await this?.notion?.databases.query({
      database_id: this.databaseId,
      filter,
      sorts
    });

    return response.results.map((result) => {
      let data = {};

      if (hasPageUrl) {
        data.pageUrl = result.url;
      }

      Object.keys(result.properties).forEach((key) => {
        data[key] = this._getValue(result.properties[key]);
      });

      return data;
    });
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
      default: {
        return data?.[data.type]?.[0]?.text?.content || "";
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

export { Database };

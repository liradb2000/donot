const contractSchema = {
  title: "contract_schema",
  version: 0,
  primaryKey: "phone",
  type: "object",
  properties: {
    phone: {
      type: "string",
      maxLength: 20,
    },
    name: {
      type: "string",
    },
    apart_id: {
      type: "array",
      ref: "apartment",
      items: {
        type: "string",
      },
    },
  },
  required: ["id", "name", "phone", "apart_id"],
  indexes: ["phone"],
};

const apartSchema = {
  title: "apart_schema",
  version: 0,
  primaryKey: "building_room",
  type: "object",
  properties: {
    building_room: {
      type: "string",
      maxLength: 100,
    },
    building: { type: "number" },
    room: { type: "number" },
    password: {
      type: "array",
      maxItems: 10,
      items: {
        type: "string",
      },
    },
  },
};

const visitSchema = {
  title: "visitlog",
  version: 0,
  primaryKey: "id",
  type: "object",
  properties: {
    id: {
      type: "string",
      maxLength: 21,
    },
    contractor: {
      ref: "contractor",
      type: "string",
    },
    apart: {
      ref: "apartment",
      type: "string",
    },
  },
};

export { contractSchema, apartSchema, visitSchema };

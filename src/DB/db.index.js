import Dexie from "dexie";

export const db = new Dexie("myDatabase");

db.version(1).stores({
  contractor: "phone", // Primary key and indexed props
  apartment: "building_room",
  m2m: "id, contractor_id, apartment_id",
  failureVisit: "++id, created_date",
  logs: "id, ts",
});

import sqlite3 from "sqlite3";
import { open } from "sqlite";

export const db = await open({
  filename: "neet.db",
  driver: sqlite3.Database
});

await db.exec(`
CREATE TABLE IF NOT EXISTS progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subject TEXT,
  chapter TEXT,
  correct INTEGER,
  time_taken INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`);

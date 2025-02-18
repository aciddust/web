import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs';

const commandLsCurrentDir = () => {
  console.log("Current directory: ", process.cwd());
  fs.readdirSync(process.cwd()).forEach(file => {
    console.log(file);
  });
}

const commandLsParentDir = () => {
  console.log("Parent directory: ", process.cwd());
  fs.readdirSync("..").forEach(file => {
    console.log(file);
  });
}

const commandLs = (path: string) => {
  console.log("Directory: ", path);
  fs.readdirSync(path).forEach(file => {
    console.log(file);
  });
}

const __dirname = new URL('.', import.meta.url).pathname;

export async function getDB() {
  commandLsCurrentDir();
  const dbPath: string = "storage/school.sqlite";

  return open({
    filename: dbPath,
    driver: sqlite3.Database,
  });
}

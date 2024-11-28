import mysql from "mysql"

export const db = mysql.createConnection({
  host: "main-db",
  user: "root",
  password: "12345678",
  database: "crud",
  port: 3306
})
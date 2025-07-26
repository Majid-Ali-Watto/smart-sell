import { db } from "../../config/db";
import { generateUUID } from "../utils/generateID";

// 1. Init Tables
export const initSalesTable = () => {
  db.execAsync(`PRAGMA foreign_keys = ON;`);

  db.execAsync(
    `CREATE TABLE IF NOT EXISTS sales (
      id TEXT PRIMARY KEY NOT NULL,
      customer TEXT,
      paid REAL,
      pending REAL,
      total REAL,
      date TEXT
    );`
  );

  db.execAsync(
    `CREATE TABLE IF NOT EXISTS sale_items (
      id TEXT PRIMARY KEY NOT NULL,
      sale_id TEXT NOT NULL,
      product TEXT,
      quantity INTEGER,
      price REAL,
      total REAL,
      FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE
    );`
  ).catch((error) => {
    console.error("Failed to initialize tables:", error);
  });
};

// 2. Save or Update Sale (Upsert)
export const saveSale = async (sale) => {
  const { id, customer, paid, pending, total, date, products } = sale;

  try {
    await db.runAsync(
      `INSERT OR REPLACE INTO sales (id, customer, paid, pending, total, date)
       VALUES (?, ?, ?, ?, ?, ?);`,
      [id, customer, paid, pending, total, new Date(date).toISOString()]
    );

    // Remove existing items (if any, for update cases)
    await db.runAsync(`DELETE FROM sale_items WHERE sale_id = ?;`, [id]);

    // Insert new items
    for (const product of products) {
      await db.runAsync(
        `INSERT INTO sale_items (id, sale_id, product, quantity, price, total)
         VALUES (?, ?, ?, ?, ?, ?);`,
        [
          await generateUUID(),
          id,
          product.product,
          product.quantity,
          product.price,
          product.total,
        ]
      );
    }

    return true;
  } catch (error) {
    console.error("Failed to save sale:", error);
    throw error;
  }
};

// 3. Get All Sales with Products
export const getSales = async () => {
  try {
    const sales = await db.getAllAsync(`
  SELECT s.*, u.fullName,u.caste, u.address,u.mobile
  FROM sales s
  LEFT JOIN users u ON s.customer = u.id
  ORDER BY s.date DESC;
`);
    //await db.getAllAsync("SELECT * FROM sales ORDER BY date DESC;");
    const items = await db.getAllAsync("SELECT * FROM sale_items;");

    return sales.map((sale) => ({
      ...sale,
      date: new Date(sale.date),
      // user: sale.fullName, // 👈 joined from users table
      products: items.filter((item) => item.sale_id === sale.id),
    }));
  } catch (error) {
    console.error("Failed to get sales:", error);
    throw error;
  }
};
export const getSaleForSpecificUser = async (customerID) => {
  try {
    const sales = await db.getAllAsync(
      `
      SELECT s.*, u.fullName, u.caste, u.address, u.mobile
      FROM sales s
      LEFT JOIN users u ON s.customer = u.id
      WHERE s.customer = ?
      ORDER BY s.date DESC;
      `,
      [customerID]
    );

    const items = await db.getAllAsync("SELECT * FROM sale_items;");

    return sales.map((sale) => ({
      ...sale,
      date: new Date(sale.date),
      products: items.filter((item) => item.sale_id === sale.id),
    }));
  } catch (error) {
    console.error("Failed to get sales:", error);
    throw error;
  }
};

// 4. Delete Sale and Its Items
export const deleteSale = async (id) => {
  try {
    await db.runAsync("DELETE FROM sale_items WHERE sale_id = ?;", [id]);
    await db.runAsync("DELETE FROM sales WHERE id = ?;", [id]);
    return true;
  } catch (error) {
    console.error("Failed to delete sale:", error);
    throw error;
  }
};

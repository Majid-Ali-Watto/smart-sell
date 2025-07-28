import { db } from "../../config/db";
import { generateUUID } from "../utils/generateID";

const PAGE_SIZE = 10
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
export const getSales = async (pageNo = 1, pageSize = PAGE_SIZE) => {
  try {
    const offset = (pageNo - 1) * pageSize;

    // 1. Get paginated sales with user data
    const sales = await db.getAllAsync(`
      SELECT s.*, u.fullName, u.caste, u.address, u.mobile
      FROM sales s
      LEFT JOIN users u ON s.customer = u.id
      ORDER BY s.date DESC
      LIMIT ${pageSize} OFFSET ${offset};
    `);

    // 2. Get all sale items (you can optimize this later per page)
    const items = await db.getAllAsync(`SELECT * FROM sale_items;`);

    // 3. Get total count for pagination UI
    const countResult = await db.getAllAsync(`SELECT COUNT(*) as total FROM sales;`);
    const total = countResult[0]?.total || 0;

    // 4. Map data
    const data = sales.map((sale) => ({
      ...sale,
      date: new Date(sale.date),
      products: items.filter((item) => item.sale_id === sale.id),
    }));

    return {
      data,
      total,
      page: pageNo,
      pageSize
    };
  } catch (error) {
    console.error("Failed to get paginated sales:", error);
    throw error;
  }
};


export const searchSales = async (query = "", pageNo = 1, pageSize = PAGE_SIZE) => {
  try {
    const offset = (pageNo - 1) * pageSize;
    const searchTerm = `%${query.toLowerCase()}%`;

    const sales = await db.getAllAsync(
      `
      SELECT s.*, u.fullName, u.caste, u.address, u.mobile
      FROM sales s
      LEFT JOIN users u ON s.customer = u.id
      WHERE 
        LOWER(u.fullName) LIKE ? OR
        LOWER(u.caste) LIKE ? OR
        LOWER(u.address) LIKE ? OR
        u.mobile LIKE ? OR
        s.id LIKE ? OR
        s.customer LIKE ?
      ORDER BY s.date DESC
      LIMIT ${pageSize} OFFSET ${offset};
      `,
      [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm]
    );

    const items = await db.getAllAsync("SELECT * FROM sale_items;");

    const countResult = await db.getAllAsync(
      `
      SELECT COUNT(*) as total
      FROM sales s
      LEFT JOIN users u ON s.customer = u.id
      WHERE 
        LOWER(u.fullName) LIKE ? OR
        LOWER(u.caste) LIKE ? OR
        LOWER(u.address) LIKE ? OR
        u.mobile LIKE ? OR
        s.id LIKE ? OR
        s.customer LIKE ?
      `,
      [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm]
    );

    const total = countResult?.[0]?.total || 0;

    const data = sales.map((sale) => ({
      ...sale,
      date: new Date(sale.date),
      products: items.filter((item) => item.sale_id === sale.id),
    }));

    return { data, total, page: pageNo, pageSize };
  } catch (error) {
    console.error("Failed to search sales:", error);
    throw error;
  }
};

export const getAllSales = async (query = "") => {
  try {
    const search = query.trim().toLowerCase();

    const sales = await db.getAllAsync(`
      SELECT s.*, u.fullName, u.caste, u.address, u.mobile
      FROM sales s
      LEFT JOIN users u ON s.customer = u.id
      ORDER BY s.date DESC;
    `);

    const items = await db.getAllAsync(`SELECT * FROM sale_items;`);

    // Optional query filtering (case insensitive)
    const filteredSales = search
      ? sales.filter(
          (sale) =>
            sale.fullName?.toLowerCase().includes(search) ||
            sale.caste?.toLowerCase().includes(search) ||
            sale.address?.toLowerCase().includes(search) ||
            sale.mobile?.includes(search) ||
            sale.id?.includes(search) ||
            sale.customer?.includes(search)
        )
      : sales;

    const data = filteredSales.map((sale) => ({
      ...sale,
      date: new Date(sale.date),
      products: items.filter((item) => item.sale_id === sale.id),
    }));

    return {
      data,
      total: data.length,
      page: 1,
      pageSize: data.length,
    };
  } catch (error) {
    console.error("Failed to get all sales:", error);
    throw error;
  }
};

export const getSaleForSpecificUser = async (customerID, page = 1, pageSize = PAGE_SIZE) => {
  try {
    const offset = (page - 1) * pageSize;

    // 1. Get paginated sales for the specific user
    const sales = await db.getAllAsync(
      `
      SELECT s.*, u.fullName, u.caste, u.address, u.mobile
      FROM sales s
      LEFT JOIN users u ON s.customer = u.id
      WHERE s.customer = ?
      ORDER BY s.date DESC
      LIMIT ? OFFSET ?;
      `,
      [customerID, pageSize, offset]
    );

    // 2. Get related sale items
    const items = await db.getAllAsync("SELECT * FROM sale_items;");

    // 3. Get total count for pagination
    const countResult = await db.getAllAsync(
      `SELECT COUNT(*) as total FROM sales WHERE customer = ?;`,
      [customerID]
    );

    const total = countResult?.[0]?.total || 0;

    // 4. Return paginated sales with items
    const data = sales.map((sale) => ({
      ...sale,
      date: new Date(sale.date),
      products: items.filter((item) => item.sale_id === sale.id),
    }));

    return {
      data,
      total,
      page,
      pageSize,
    };
  } catch (error) {
    console.error("Failed to get paginated sales for user:", error);
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

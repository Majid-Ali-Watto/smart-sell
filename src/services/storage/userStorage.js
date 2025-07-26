import { db } from "../../config/db";

// Initialize the users table
export const initUserTable = async () => {
  try {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY NOT NULL,
        fullName TEXT NOT NULL,
        caste TEXT,
        mobile TEXT,
        address TEXT
      );
    `);
  } catch (error) {
    console.error("Failed to create users table:", error);
  }
};


export const loadUsers = async () => {
  try {
    const result = await db.getAllAsync(`
      SELECT 
        u.id,
        u.fullName,
        u.caste,
        u.mobile,
        u.address,
        IFNULL(SUM(s.total), 0) AS total,
        IFNULL(SUM(s.paid), 0) AS given,
        IFNULL(SUM(s.total - s.paid), 0) AS pending
      FROM users u
      LEFT JOIN sales s ON u.id = s.customer
      GROUP BY u.id;
    `);
    return result;
  } catch (error) {
    console.error("Failed to load users:", error);
    throw error;
  }
};

// Add a user
export const addUser = async (user) => {
  try {
    await db.runAsync(
      `INSERT INTO users (id, fullName, caste, mobile, address)
       VALUES (?, ?, ?, ?, ?);`,
      [
        user.id,
        user.fullName,
        user.caste,
        user.mobile,
        user.address
      ]
    );
  } catch (error) {
    console.error("Failed to add user:", error);
    throw error;
  }
};

// Get a user by ID
export const getUserById = async (id) => {
  try {
    const result = await db.getFirstAsync(`SELECT * FROM users WHERE id = ?;`, [
      id,
    ]);
    return result || null;
  } catch (error) {
    console.error("Failed to get user:", error);
    throw error;
  }
};

// Update a user
export const updateUser = async (user) => {
  try {
    await db.runAsync(
      `UPDATE users
       SET fullName = ?, caste = ?, mobile = ?, address = ? WHERE id = ?;`,
      [
        user.fullName,
        user.caste,
        user.mobile,
        user.address,
        user.id,
      ]
    );
  } catch (error) {
    console.error("Failed to update user:", error);
    throw error;
  }
};

// Delete a user
export const deleteUser = async (id) => {
  try {
    await db.runAsync(`DELETE FROM users WHERE id = ?;`, [id]);
  } catch (error) {
    console.error("Failed to delete user:", error);
    throw error;
  }
};

export const userWithAllSales = async (userId) => {
  try {
    const result = await db.getAllAsync(
      `
      SELECT 
        users.id AS userId,
        users.fullName,
        users.mobile,
        users.address,
        sales.id AS saleId,
        sales.product,
        sales.quantity,
        sales.price,
        sales.total AS saleTotal,
        sales.paid,
        sales.date
      FROM users
      LEFT JOIN sales ON users.id = sales.customer
      WHERE users.id = ?;
      `,
      [userId]
    );
    return result;
  } catch (error) {
    console.error("Failed to get users with all sales:", error);
    throw error;
  }
};

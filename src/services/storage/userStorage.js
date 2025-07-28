import { db } from "../../config/db";
const PAGE_SIZE = 10
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


export const loadUsers = async (page = 1, pageSize = PAGE_SIZE) => {
  try {
    const offset = (page - 1) * pageSize;

    // Fetch paginated users with summary
    const users = await db.getAllAsync(`
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
      GROUP BY u.id
      ORDER BY u.fullName
      LIMIT ${pageSize}
      OFFSET ${offset};
    `);

    // Fetch total user count
    const countResult = await db.getAllAsync(`
      SELECT COUNT(*) AS count FROM users;
    `);

    const total = countResult[0]?.count || 0;

    return {
      data: users,
      total,
      page,
      pageSize,
    };
  } catch (error) {
    console.error("Failed to load users with pagination:", error);
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

export const userWithAllSales = async (
  query = "",
  page = 1,
  pageSize = PAGE_SIZE,
) => {
  try {
    const offset = (page - 1) * pageSize;
    const search = `%${query}%`;

    const whereClause = query
      ? `
        WHERE 
          users.id LIKE ? OR 
          users.fullName LIKE ? OR 
          users.caste LIKE ? OR 
          users.mobile LIKE ? OR 
          users.address LIKE ?
      `
      : "";

    const params = query ? [search, search, search, search, search] : [];

    // Step 1: Get user & sale summary
    const users = await db.getAllAsync(
      `
      SELECT 
        users.id,
        users.fullName,
        users.caste,
        users.mobile,
        users.address,
        IFNULL(SUM(s.total), 0) AS total,
        IFNULL(SUM(s.paid), 0) AS given,
        IFNULL(SUM(s.total - s.paid), 0) AS pending
      FROM users
      LEFT JOIN sales s ON users.id = s.customer
      ${whereClause}
      GROUP BY users.id
      ORDER BY users.fullName
      LIMIT ${pageSize}
      OFFSET ${offset};
      `,
      params
    );

    const countResult = await db.getAllAsync(
      `
      SELECT COUNT(DISTINCT users.id) AS count
      FROM users
      LEFT JOIN sales s ON users.id = s.customer
      ${whereClause};
      `,
      params
    );

    const total = countResult[0]?.count || 0;

    return {
      data: users,
      total,
      page,
      pageSize,
    };
  } catch (error) {
    console.error("Failed to get users with all sales:", error);
    throw error;
  }
};
export const getUserForSaleForm = async (query = "") => {
  try {
    const search = `%${query}%`;

    const whereClause = query
      ? `
        WHERE 
          users.id LIKE ? OR 
          users.fullName LIKE ? OR 
          users.caste LIKE ? OR 
          users.mobile LIKE ? OR 
          users.address LIKE ?
      `
      : "";

    const params = query ? [search, search, search, search, search] : [];

    // ✅ Step 1: Get users
    const users = await db.getAllAsync(
      `
      SELECT 
        users.id,
        users.fullName,
        users.caste,
        users.mobile,
        users.address
      FROM users
      ${whereClause}
      `,
      params
    );

    return {
      data: users,
    };
  } catch (error) {
    console.error("Failed to get users for sale form:", error);
    throw error;
  }
};

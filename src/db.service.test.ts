import { DBService } from "./db.service";
import { Expense } from "./model/expense";

import { Pool } from "pg";

const mockPool = {
  query: jest.fn(() => {}),
};

jest.mock("pg", () => {
  return {
    Pool: jest.fn().mockImplementation(() => mockPool),
  };
});

describe("DBService", () => {
  const mockConnectionString = "fake-connection-string";
  let dbService: DBService;

  beforeEach(() => {
    (Pool as unknown as jest.Mock).mockClear();
    mockPool.query.mockClear();
    dbService = new DBService("fake-connection-string");
  });

  // Test case for the constructor
  describe("Constructor", () => {
    it("should initialize a Pool instance with the provided connection string", () => {
      expect(Pool).toHaveBeenCalledWith({
        connectionString: mockConnectionString,
      });
    });
  });

  // Test case for the `insert` method
  describe("insert", () => {
    it("should not insert when database throws an error", async () => {
      const expense: Expense = {
        date: new Date().toISOString(),
        amount: 100,
        description: "Dinner",
      };

      mockPool.query.mockImplementationOnce(() =>
        Promise.reject(new Error("Database Error"))
      );

      await expect(dbService.insert(expense)).rejects.toThrow("Database Error");

      expect(mockPool.query).toHaveBeenCalledWith(
        "INSERT INTO expensetable (description, amount, date) VALUES ($1, $2, $3) RETURNING *;",
        [expense.description, expense.amount, expense.date]
      );
    });

    it("should return saved expense when insert is called", async () => {
      const expense: Expense = {
        date: new Date().toISOString(),
        amount: 100,
        description: "Dinner",
      };

      mockPool.query.mockImplementationOnce(() =>
        Promise.resolve({ rows: [expense] })
      );

      const storedExpense = await dbService.insert(expense);

      expect(storedExpense).toEqual(expense);

      expect(mockPool.query).toHaveBeenCalledWith(
        "INSERT INTO expensetable (description, amount, date) VALUES ($1, $2, $3) RETURNING *;",
        [expense.description, expense.amount, expense.date]
      );
    });
  });

  // Test case for the `delete` method
  describe("delete", () => {
    it("should not delete when provided wrong id is not positive number", async () => {
      await expect(dbService.delete(-1)).rejects.toThrow(
        "Expense could not be deleted. Please provide valid expense ID."
      );

      expect(mockPool.query).toHaveBeenCalledTimes(0);
    });

    it("should not delete when tried to delete non-exist expense", async () => {
      mockPool.query.mockImplementationOnce(() =>
        Promise.resolve({ rows: [] })
      );
      await expect(dbService.delete(1)).rejects.toThrow(
        "Expense could not be deleted."
      );

      expect(mockPool.query).toHaveBeenCalledTimes(1);
    });

    it("should not delete when database throws an error", async () => {
      mockPool.query.mockImplementationOnce(() =>
        Promise.reject(new Error("Database Error"))
      );
      await expect(dbService.delete(1)).rejects.toThrow("Database Error");

      expect(mockPool.query).toHaveBeenCalledTimes(1);
    });

    it("should return true when an expense is deleted", async () => {
      mockPool.query.mockImplementationOnce(() => {
        const expense: Expense = {
          description: "Test Data",
          amount: 10,
          date: new Date().toISOString(),
        };

        return Promise.resolve({ rows: [expense] });
      });

      const isDeleted = await dbService.delete(1);

      expect(isDeleted).toBe(true);
      expect(mockPool.query).toHaveBeenCalledTimes(1);
      expect(mockPool.query).toHaveBeenCalledWith(
        "DELETE FROM expensetable WHERE id=$1 RETURNING *;",
        [1]
      );
    });
  });

  // Test case for the `update` method
  describe("update", () => {
    it("should not update when provided wrong id is not positive number", async () => {
      await expect(dbService.update(-1, {})).rejects.toThrow(
        "Expense could not be updated. Please provide valid expense ID."
      );

      expect(mockPool.query).toHaveBeenCalledTimes(0);
    });

    it("should not update when any field is not provided", async () => {
      await expect(dbService.update(1, {})).rejects.toThrow(
        "Please provide the value of the field you want to update."
      );
      expect(mockPool.query).toHaveBeenCalledTimes(0);
    });

    it("should not update when database throws an error", async () => {
      mockPool.query.mockImplementationOnce(() =>
        Promise.reject(new Error("Database Error"))
      );
      await expect(dbService.update(1, { amount: 12 })).rejects.toThrow(
        "Database Error"
      );

      expect(mockPool.query).toHaveBeenCalledTimes(1);
    });

    it("should not update when tried to update non-exist expense", async () => {
      mockPool.query.mockImplementationOnce(() =>
        Promise.resolve({ rows: [] })
      );
      await expect(dbService.update(1, { amount: 1 })).rejects.toThrow(
        "Expense could not be updated."
      );

      expect(mockPool.query).toHaveBeenCalledTimes(1);
    });

    it("should update expense: (amount)", async () => {
      const expense: Expense = {
        date: new Date().toISOString(),
        amount: 100,
        description: "Dinner",
      };

      mockPool.query.mockImplementationOnce(() =>
        Promise.resolve({ rows: [expense] })
      );

      const updatedExpense = await dbService.update(1, { amount: 100 });

      expect(updatedExpense).toEqual(expense);
      expect(mockPool.query).toHaveBeenCalledTimes(1);
      expect(mockPool.query).toHaveBeenCalledWith(
        "UPDATE expensetable SET amount=$2 WHERE id=$1 RETURNING *;",
        [1, 100]
      );
    });

    it("should update expense: (description)", async () => {
      const expense: Expense = {
        date: new Date().toISOString(),
        amount: 100,
        description: "Dinner",
      };

      mockPool.query.mockImplementationOnce(() =>
        Promise.resolve({ rows: [expense] })
      );

      const updatedExpense = await dbService.update(1, {
        description: "Dinner",
      });

      expect(updatedExpense).toEqual(expense);
      expect(mockPool.query).toHaveBeenCalledTimes(1);
      expect(mockPool.query).toHaveBeenCalledWith(
        "UPDATE expensetable SET description=$2 WHERE id=$1 RETURNING *;",
        [1, "Dinner"]
      );
    });

    it("should update expense: (date)", async () => {
      const date = new Date().toISOString();
      const expense: Expense = {
        date: date,
        amount: 100,
        description: "Dinner",
      };

      mockPool.query.mockImplementationOnce(() =>
        Promise.resolve({ rows: [expense] })
      );

      const updatedExpense = await dbService.update(1, { date });

      expect(updatedExpense).toEqual(expense);
      expect(mockPool.query).toHaveBeenCalledTimes(1);
      expect(mockPool.query).toHaveBeenCalledWith(
        "UPDATE expensetable SET date=$2 WHERE id=$1 RETURNING *;",
        [1, date]
      );
    });
  });

  // Test case for the `findAll` method
  describe("findAll", () => {
    it("should thrown an error when database throws an error", async () => {
      mockPool.query.mockImplementationOnce(() =>
        Promise.reject(new Error("Database Error"))
      );
      await expect(dbService.findAll()).rejects.toThrow("Database Error");

      expect(mockPool.query).toHaveBeenCalledTimes(1);
    });

    it("should return expenses ", async () => {
      const expense: Expense = {
        description: "Test Data",
        amount: 10,
        date: new Date().toISOString(),
      };

      mockPool.query.mockImplementationOnce(() =>
        Promise.resolve({ rows: [] })
      );
      const resp1 = await dbService.findAll();
      expect(resp1).toHaveLength(0);

      mockPool.query.mockImplementationOnce(() =>
        Promise.resolve({ rows: [expense] })
      );
      const resp2 = await dbService.findAll();
      expect(resp2).toEqual([expense]);
    });
  });
});

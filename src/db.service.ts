import { Pool } from "pg";
import { Expense } from "./model/expense";

export class DBService {
  #pool: Pool;
  constructor(connectionString: string) {
    this.#pool = new Pool({ connectionString });
  }
  async insert(expense: Expense): Promise<Expense> {
    try {
      const storedExpense = await this.#pool.query<Expense, any>(
        "INSERT INTO expensetable (description, amount, date) VALUES ($1, $2, $3) RETURNING *;",
        [expense.description, expense.amount, expense.date]
      );
      return storedExpense.rows[0];
    } catch (error: any) {
      throw error;
    }
  }

  async delete(id: number): Promise<boolean> {
    if (id <= 0)
      throw new Error(
        "Expense could not be deleted. Please provide valid expense ID."
      );
    try {
      const deletedExpense = await this.#pool.query(
        "DELETE FROM expensetable WHERE id=$1 RETURNING *;",
        [id]
      );
      if (deletedExpense.rows.length === 0) {
        throw new Error("Expense could not be deleted.");
      }
      return true;
    } catch (error: any) {
      throw error;
    }
  }
  async update(id: number, expense: Partial<Expense>): Promise<Expense> {
    const { description, amount, date } = expense;

    if (id <= 0)
      throw new Error(
        "Expense could not be updated. Please provide valid expense ID."
      );

    if (
      description === undefined &&
      amount === undefined &&
      date === undefined
    ) {
      throw new Error(
        "Please provide the value of the field you want to update."
      );
    }

    let arr: string[] = [];
    let values: any[] = [id];
    let index = 1;
    if (description && description.trim().length !== 0) {
      arr.push(`description=$${++index}`);
      values.push(description);
    }

    if (amount !== undefined) {
      arr.push(`amount=$${++index}`);
      values.push(amount);
    }

    if (date && date.trim().length !== 0) {
      arr.push(`date=$${++index}`);
      values.push(date);
    }

    const queryString = `UPDATE expensetable SET ${arr.join(
      ", "
    )} WHERE id=$1 RETURNING *;`;

    try {
      const updatedExpense = await this.#pool.query(queryString, values);
      if (updatedExpense.rows.length === 0) {
        throw new Error("Expense could not be updated.");
      }
      return updatedExpense.rows[0];
    } catch (error: any) {
      throw error;
    }
  }
  async findAll(): Promise<Expense[]> {
    try {
      const resp = await this.#pool.query(
        "SELECT id, description, amount, date FROM expensetable;"
      );
      return resp.rows;
    } catch (error: any) {
      throw error;
    }
  }

  async stop() {
    try {
      await this.#pool.end();
    } catch (error: any) {
      throw error;
    }
  }
}

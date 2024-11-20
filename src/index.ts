import "dotenv/config";

import { Command } from "commander";
import { DBService } from "./db.service";
import { Expense } from "./model/expense";

if (process.env.DB_URL) {
  const program = new Command();
  const dbService = new DBService(process.env.DB_URL);

  program
    .name("expense-tracker-cli")
    .description("Expense Tracker CLI App to Manage Your Finances")
    .version("0.0.1");

  program
    .command("add")
    .description("Add a expense")
    .requiredOption("--description <description>", "Expense description")
    .requiredOption("--amount <amount>", "Amount that is spent for the expense")
    .action(async (options) => {
      const { description, amount } = options;
      await addExpense(description, amount);
    });

  program
    .command("delete")
    .description("Delete an expense")
    .requiredOption("--id <id>", "Delete the expense with the given id")
    .action(async (options) => {
      await deleteExpense(options.id);
    });

  program
    .command("list")
    .description("View all expenses")
    .action(async () => {
      await getExpenses();
    });

  program
    .command("update")
    .description("Update the expense")
    .requiredOption("--id <id>", "Expense id")
    .requiredOption("--amount <amount>", "Amount that is spent for the expense")
    .action(async (options) => {
      const { id, amount } = options;
      await updateExpense(id, amount);
    });

  program.parse(process.argv);

  async function addExpense(description: string, amount: number) {
    const newExpense: Expense = {
      description,
      amount,
      date: new Date().toISOString(),
    };

    try {
      const expense = await dbService.insert(newExpense);
      console.log(`Expense added successfully (ID: ${expense.id})`);
    } catch (error) {
      console.error(error);
    } finally {
      await dbService.stop().catch((err) => console.error(err));
    }
  }

  async function getExpenses() {
    try {
      const expenses = await dbService.findAll();
      console.log("# ID\tDate\tDescription\tAmount");
      expenses.forEach((expense) => {
        console.log(
          `# ${expense.id}\t${new Date(expense.date).toLocaleDateString()}\t${
            expense.description
          }\t$${expense.amount}.`
        );
      });
    } catch (error) {
      console.error(error);
    } finally {
      await dbService.stop().catch((err) => console.error(err));
    }
  }

  async function updateExpense(id: number, amount: number) {
    try {
      const updatedExpense = await dbService.update(id, { amount });
      console.log(
        `Expense updated successfully (ID: ${updatedExpense.id}, amount: $${updatedExpense.amount})`
      );
    } catch (error) {
      console.error(error);
    } finally {
      await dbService.stop().catch((err) => console.error(err));
    }
  }

  async function deleteExpense(id: number) {
    try {
      const isDeleted = await dbService.delete(id);
      console.log(`Expense deleted successfully (ID: ${id})`);
    } catch (error) {
      console.error(error);
    } finally {
      await dbService.stop().catch((err) => console.error(err));
    }
  }
} else {
  console.error("Could not connect to database.");
}

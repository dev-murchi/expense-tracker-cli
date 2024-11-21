import "dotenv/config";

import { Command, Option, InvalidOptionArgumentError } from "commander";
import { DBService } from "./db.service";
import { Expense } from "./model/expense";

if (!process.env.DB_URL) {
  console.error("Could not connect to database.");
  process.exit(1);
}

const program = new Command();
const dbService = new DBService(process.env.DB_URL);

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "Jully",
  "August",
  "September",
  "October",
  "November",
  "December",
];

program
  .name("expense-tracker-cli")
  .description("Expense Tracker CLI App to Manage Your Finances")
  .version("0.0.1");

program
  .command("add")
  .description("Add a expense")
  .addOption(
    new Option("--description <description>", "Expense description")
      .makeOptionMandatory()
      .argParser(parseString)
  )
  .addOption(
    new Option("--amount <amount>", "Amount that is spent for the expense")
      .makeOptionMandatory()
      .argParser(parseNonNegativeInteger)
  )
  .action(async (options) => {
    const { description, amount } = options;
    try {
      await addExpense(description, amount);
    } catch (error: any) {
      console.error("Could not add the expense!");
      console.error(error);
    }
  });

program
  .command("delete")
  .description("Delete an expense")
  .addOption(
    new Option("--id <id>", "Delete the expense with the given id")
      .makeOptionMandatory()
      .argParser(parsePositiveInteger)
  )
  .action(async (options) => {
    try {
      await deleteExpense(options.id);
    } catch (error: any) {
      console.error("Could not delete the expense!");
      console.error(error);
    }
  });

program
  .command("list")
  .description("View all expenses")
  .action(async () => {
    try {
      await getExpenses();
    } catch (error: any) {
      console.error("Could not get the expenses!");
      console.error(error);
    }
  });

program
  .command("summary")
  .description("Summary of all expenses")
  .addOption(
    new Option("--month <month>", "Summary of expenses in given month")
      .choices(Array.from(new Array(12)).map((value, index) => `${index + 1}`))
      .implies({ year: new Date().getFullYear() })
  )
  .addOption(
    new Option("--year <year>", "Summary of expenses in given year").argParser(
      parseNonNegativeInteger
    )
  )
  .action(async (options) => {
    try {
      let { month, year } = options;
      if (month !== undefined) {
        month = parseInt(month, 10) - 1;
      }
      const sum = await expenseSummary(year, month);
      if (year === undefined && month === undefined) {
        console.log(`# Total expenses: $${sum}`);
      } else if (month === undefined) {
        console.log(`# Total expenses for ${year}: $${sum}`);
      } else {
        console.log(
          `# Total expenses for ${months[month]} of ${year}: $${sum}`
        );
      }
    } catch (error: any) {
      console.error("Expense summary could not be calculated!");
      console.error(error);
    }
  });

program
  .command("update")
  .description("Update the expense")
  .addOption(
    new Option("--id <id>", "Expense id")
      .makeOptionMandatory()
      .argParser(parsePositiveInteger)
  )
  .addOption(
    new Option("--amount <amount>", "Amount that is spent for the expense")
      .makeOptionMandatory()
      .argParser(parseNonNegativeInteger)
  )
  .action(async (options) => {
    const { id, amount } = options;
    try {
      await updateExpense(id, amount);
    } catch (error: any) {
      console.error("Could not update the expense!");
      console.error(error);
    }
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
    await dbService.stop();
    console.log(`Expense added successfully (ID: ${expense.id})`);
  } catch (error: any) {
    dbService.stop().catch((err) => console.error(err));
    throw new Error(error);
  }
}

async function getExpenses() {
  try {
    const expenses = await dbService.findAll();
    await dbService.stop();
    console.log("# ID\tDate\tDescription\tAmount");
    expenses.forEach((expense) => {
      console.log(
        `# ${expense.id}\t${new Date(expense.date).toLocaleDateString()}\t${
          expense.description
        }\t$${expense.amount}.`
      );
    });
  } catch (error: any) {
    dbService.stop().catch((err) => console.error(err));
    throw new Error(error);
  }
}

async function updateExpense(id: number, amount: number) {
  try {
    const updatedExpense = await dbService.update(id, { amount });
    await dbService.stop();
    console.log(
      `Expense updated successfully (ID: ${updatedExpense.id}, amount: $${updatedExpense.amount})`
    );
  } catch (error: any) {
    dbService.stop().catch((err) => console.error(err));
    throw new Error(error);
  }
}

async function deleteExpense(id: number) {
  try {
    const isDeleted = await dbService.delete(id);
    await dbService.stop();
    console.log(`Expense deleted successfully (ID: ${id})`);
  } catch (error: any) {
    dbService.stop().catch((err) => console.error(err));
    throw new Error(error);
  }
}

async function expenseSummary(
  year: number | undefined,
  month: number | undefined
) {
  try {
    const expenses = await dbService.findAll();
    await dbService.stop();

    if (year === undefined && month === undefined) {
      return expenses.reduce((prev, curr) => prev + curr.amount, 0);
    } else if (month === undefined) {
      return expenses.reduce((prev, curr) => {
        if (new Date(curr.date).getFullYear() === year) {
          return prev + curr.amount;
        }
        return prev;
      }, 0);
    } else {
      return expenses.reduce((prev, curr) => {
        const expenseDate = new Date(curr.date);
        if (
          expenseDate.getFullYear() === year &&
          expenseDate.getMonth() === month
        ) {
          return prev + curr.amount;
        }
        return prev;
      }, 0);
    }
  } catch (error: any) {
    dbService.stop().catch((err) => console.error(err));
    throw new Error(error);
  }
}

function parseNonNegativeInteger(value: string): number {
  const parsedNumber = parseInt(value, 10);
  if (isNaN(parsedNumber) || parsedNumber < 0) {
    throw new InvalidOptionArgumentError(
      "Provided value must be non-negative!"
    );
  }

  return parsedNumber;
}

function parsePositiveInteger(value: string): number {
  const parsedNumber = parseInt(value, 10);
  if (isNaN(parsedNumber) || parsedNumber <= 0) {
    throw new InvalidOptionArgumentError("Provided value must be positive!");
  }

  return parsedNumber;
}

function parseString(str: string): string {
  if (str.trim().length === 0) {
    throw new InvalidOptionArgumentError("Please provide a description!");
  }
  return str.trim();
}

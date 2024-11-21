# Expense Tracker CLI App

## Overview

Expense Tracker CLI App is a simple command-line tool that helps you manage and track your personal finances. It allows you to easily add, update, delete, list, and summarize your expenses directly from the terminal. This app is ideal for individuals who prefer managing their expenses on the go without the need for a graphical interface.

## Features

- **Add expenses**: Quickly log your daily expenses with descriptions and amounts.
- **Delete expenses**: Remove any mistakenly added expense by ID.
- **List all expenses**: View all recorded expenses in one place.
- **Expense summary**: Get a summary of all your expenses for a given month and year.
- **Update expenses**: Modify the amount for any expense entry.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
  - [Commands](#commands)
  - [Examples](#examples)
  - [Options](#options)
- [Dependencies](#dependencies)
- [License](#license)

## Installation

To get started with the Expense Tracker CLI App:

1. **Clone this repository to your local machine:**

```bash
git clone https://github.com/dev-murchi/expense-tracker-cli.git
```

2. **Navigate into the project directory:**

```bash
cd expense-tracker-cli
```

3. **Install dependencies:** (You can use `npm` instead of `yarn`)

```bash
yarn install
```

4. **Now you can use the CLI app by running the following commands:**

```bash
yarn build
yarn start
```

## Usage

Once the app is installed, you can access all commands using the following syntax:

```bash
yarn start <command> [options]
```

### Commands

`add` - Add a new expense.

```bash
yarn start add --description <description> --amount <amount>
```

- `--description`: The description of the expense (e.g., "Lunch").
- `--amount`: The amount spent for the expense (e.g., 20.50).

`delete` - Delete an expense by its ID.

```bash
yarn start delete --id <id>
```

- `--id`: The ID of the expense to delete.

`list` - List all recorded expenses.

```bash
yarn start list
```

This command will show all the expenses recorded so far.

`summary` - Generate a summary of expenses for a particular month and/or year.

```bash
yarn start summary [--month <month>] [--year <year>]
```

- `--month`: Optional. Filter by month (1-12).
- `--year`: Optional. Filter by year (e.g., 2024).

`update` - Update the amount of an existing expense.

```bash
yarn start update --id <id> --amount <new amount>
```

- `--id`: The ID of the expense to update.
- `--amount`: The new amount for the expense.

### Examples

**Add a new expense:**

```bash
yarn start add --description "Lunch" --amount 15.75
```

**Delete an expense:**

```bash
yarn start delete --id 101
```

**List all expenses:**

```bash
yarn start list
```

**Get a summary of expenses for October 2023:**

```bash
yarn start summary --month 10 --year 2023
```

**Update an expense amount:**

```bash
yarn start update --id 101 --amount 20.00
```

### Options

- **Required Options:** Certain commands, like `add`, `delete`, and `update`, require options such as `--description`, `--id`, and `--amount`. Ensure these are provided.

- **Optional Options:** For the `summary` command, both `--month` and `--year` are optional. If not provided, a summary of all expenses will be shown.

## Dependencies

This project uses the following dependencies:

**Commander**: A Node.js library for building CLI applications.

**pg**: A PostgreSQL client for Node.js, used for storing and retrieving expenses from a PostgreSQL database.

## License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/dev-murchi/expense-tracker-cli/blob/main/LICENSE) file for details.

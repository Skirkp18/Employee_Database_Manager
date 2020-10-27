var mysql = require("mysql");
var chalk = require("chalk");
var inquirer = require('inquirer');
var path = require("path");
var fs = require("fs");

// Inquirer Questions
const startQuestions = [
    {
        type: "list",
        name: "startQuestion",
        message: "What would you like to do?",
        choices: ["Add Employee", "Remove Employee", "Edit Employee", new inquirer.Separator(), "All Employees", "Employees By Department", "Employees By Role", new inquirer.Separator(), "Add New Department", "Add New Role", new inquirer.Separator()]
    }
]

// create the connection information for the sql database
var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "G@rtail181993",
  database: "employee_info_db"
});

connection.connect(function(err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId + "\n");
  start();
  });


//   start function that starts inquier
async function start() {
    try {
    inquirer.prompt(startQuestions)
    .then(answers => {
        let navigation = answers.startQuestion
        // console.info('Answer:', answers.startQuestion);
        console.log(navigation);
    });
    connection.end();
    } catch (error) {
    console.log("Error")
    }
};
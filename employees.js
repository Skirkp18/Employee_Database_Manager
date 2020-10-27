var mysql = require("mysql");
var chalk = require("chalk");
var inquirer = require('inquirer');
var path = require("path");
var fs = require("fs");
const { stringify } = require("querystring");

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

// Arrays to fill from database
let currentEmployees = [];
let currentRoles = [];
let currentDepartments = [];


connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
    getCurrentEmployees();
    getCurrentRoles();
    getCurrentDepartments();
    start();
});


//   start function that starts inquier
function start() {
    inquirer.prompt({
        type: "list",
        name: "startQuestion",
        message: "What would you like to do?",
        choices: ["Add Employee", "Remove Employee", "Edit Employee", new inquirer.Separator(), "All Employees", "Employees By Department", "Employees By Role", new inquirer.Separator(), "Add New Department", "Add New Role", new inquirer.Separator()]
    })
        .then(function (answer) {
            switch (answer.startQuestion) {
                case "Add Employee":
                    console.log(chalk.green("Add Employee"));
                    addNewEmployee();
                    break;

                case "Remove Employee":
                    console.log(chalk.red("Remove Employee"));
                    removeEmployee();
                    break;

                case "Edit Employee":
                    console.log(chalk.yellow("Edit Employee"));
                    break;

                case "All Employees":
                    console.log(chalk.blue("Viewing All Employess"));
                    break;

                case "Employees By Department":
                    console.log(chalk.magenta("Viewing Employees By Departement"));
                    break;

                case "Employees By Role":
                    console.log(chalk.cyan("Employees By Role"));
                    break;

                case "Add New Department":
                    console.log(chalk.inverse("Add New Department"));
                    break;

                case "Add New Role":
                    console.log(chalk.inverse("Add New Role"));
                    break;
            }
        });
};


function addNewEmployee() {
    inquirer.prompt([
        {
            type: "prompt",
            name: "first_name",
            message: "Add New Employee's First Name"
        },
        {
            type: "prompt",
            name: "last_name",
            message: "Add New Employee's Last Name"
        },
        {
            name: "role",
            type: "list",
            choices: function () {
                var choiceArray = [];
                for (var i = 0; i < currentRoles.length; i++) {
                    choiceArray.push(currentRoles[i].title);
                }
                return choiceArray;
            },
            message: "What Is The New Employee's Role?"
        },
        {
            name: "manager_id",
            type: "prompt",
            message: "Who Is The Employees Manager? (Please Enter Manager_ID)",
            validate: function (value) {
                if (isNaN(value) === false) {
                    return true;
                }
                return false;
            }
        }
    ])
        .then(function (answer) {
            const first_Name = answer.first_name;
            const last_Name = answer.last_name;
            const newEmployee = [{
                "first_name": first_Name,
                "last_name": last_Name,
                "role_id": getRoleId(answer.role),
                "manager_id": answer.manager_id
            }]
                    console.table(newEmployee);

                    connection.query("INSERT INTO employee SET ?", newEmployee, function(err) {
                        if (err) throw err;
                        console.log("Employee Added Succesfully!");
                    });
                



        });
};

function removeEmployee() {
    getCurrentEmployees()
    inquirer.prompt([
        {
            name: "employee",
            type: "list",
            choices: function () {
                var choiceArray = [];
                for (var i = 0; i < currentEmployees.length; i++) {
                    choiceArray.push(currentEmployees[i].first_name + " " + currentEmployees[i].last_name);
                }
                return choiceArray;
            },
            message: "Which Employee Would You Like To Remove?"
        }
    ]).then(function(answer) {
        const name = answer.employee
        const employeeToRemove = getEmployeeId(name);
        console.log(employeeToRemove);
        connection.query("DELETE FROM employee WHERE id = ?", employeeToRemove, function(err) {
            if (err) throw err;
            console.log(chalk.red("Employee Deleted!"));
        });
    });
};

function editEmployeeInfo() {

};

function getCurrentEmployees() {
    connection.query("SELECT * FROM employee", function (err, res) {
        if (err) throw err;

        currentEmployees = res;
        // console.log(chalk.bgBlue("Current Employees:"));
        // console.table(currentEmployees);
    });
};

function getCurrentRoles() {
    connection.query("SELECT * FROM role", function (err, res) {
        if (err) throw err;

        currentRoles = res;
        // console.log(chalk.bgBlue("Current Roles:"));
        // console.table(currentRoles);
    });
};

function getCurrentDepartments() {
    connection.query("SELECT * FROM department", function (err, res) {
        if (err) throw err;

        currentDepartments = res;
        // console.log(chalk.bgBlue("Current Departments:"));
        // console.table(currentDepartments);
    });
};

function getRoleId(role) {
    for (let i = 0; i < currentRoles.length; i++) {
        if (role === currentRoles[i].title) {
        const roleId = currentRoles[i].id;
        return roleId;
        }
    }
};

function getEmployeeId(employee) {
    for (let i = 0; i < currentEmployees.length; i++) {
        const name = currentEmployees[i].first_name + " " + currentEmployees[i].last_name;
        console.log(name);
        if (employee === name) {
        const employeeId = currentEmployees[i].id;
        return employeeId;
        }
    }
}
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


// FUNCTION THAT STARTS INQUIRER
function start() {
    inquirer.prompt({
        type: "list",
        name: "startQuestion",
        message: "What would you like to do?",
        choices: ["Add Employee", "Remove Employee", "Edit Employee", new inquirer.Separator(), "All Employees", "Employees By Department", "Employees By Role", new inquirer.Separator(), "Add New Department", "Add New Role", new inquirer.Separator(), "Exit", new inquirer.Separator()]
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
                    editEmployeeInfo();
                    break;

                case "All Employees":
                    console.log(chalk.blue("Viewing All Employees:"));
                    displayAllEmployees();
                    break;

                case "Employees By Department":
                    console.log(chalk.magenta("Viewing Employees By Departement"));
                    displayEmployeesByDepartment();
                    break;

                case "Employees By Role":
                    console.log(chalk.cyan("Employees By Role"));
                    displayEmployeesByRole();
                    break;

                case "Add New Department":
                    console.log(chalk.inverse("Add New Department"));
                    addNewDepartment();
                    break;

                case "Add New Role":
                    console.log(chalk.inverse("Add New Role"));
                    addNewRole();
                    break;

                case "Exit":
                    console.log("Closing Program");
                    connection.end();
                    break;
            }
        });
};

// FUNCTIONS FOR SECTION ONE OF OPTIONS (ADD, REMOVE, EDIT)
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
                        getCurrentEmployees();
                        start();
                    });
                



        });
};

function removeEmployee() {
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
            getCurrentEmployees();
            start();
        });
    });
};

function editEmployeeInfo() {
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
            message: "Which Employee Would You Like To Edit?"
        }
    ]).then(function(answer) {
        const name = answer.employee
        const employeeToEdit = getEmployeeId(name);
        inquirer.prompt([
            {
                type: "prompt",
                name: "first_name",
                message: "Update Employee's First Name"
            },
            {
                type: "prompt",
                name: "last_name",
                message: "Update Employee's Last Name"
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
                message: "What Is The Employee's New Role?"
            },
            {
                name: "manager_id",
                type: "prompt",
                message: "Who Is The Employees New Manager? (Please Enter Manager_ID)",
                validate: function (value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    return false;
                }
            }
        ])
            .then(function (answer) {
                        connection.query(`UPDATE employee SET first_name = '${answer.first_name}', last_name = '${answer.last_name}', role_id = '${getRoleId(answer.role)}', manager_id = '${answer.manager_id}' WHERE id = ${employeeToEdit}`,  function(err) {
                            if (err) throw err;
                            console.log("Employee Info Updated!")
                            getCurrentEmployees();
                            start();
                        });
            });
    })
};

// FUNCTIONS FOR SECTION TWO OF OPTIONS (ALL EMPLOYESS, EMPLOYEES BY DEPARTMENT, EMPLOYEES BY ROLE)
function displayAllEmployees() {
    const allEmployeesArray = [];
    for (let i = 0; i < currentEmployees.length; i++) {
        const departmentId = getDepartmentId(currentEmployees[i].role_id)
        const employee = {
        FirstName: currentEmployees[i].first_name,
        LastName: currentEmployees[i].last_name,
        Role: getRoleTitle(currentEmployees[i].role_id),
        Salary: getRoleSalary(currentEmployees[i].role_id),
        Department: getDepartment(departmentId)
        };
        allEmployeesArray.push(employee);
    }
    console.table(allEmployeesArray);
    start();
};

function displayEmployeesByDepartment() {
    const employeesToDisplay = [];
    inquirer.prompt([
        {
            name: "department",
            type: "list",
            choices: function () {
                var choiceArray = [];
                for (var i = 0; i < currentDepartments.length; i++) {
                    choiceArray.push(currentDepartments[i].name);
                }
                return choiceArray;
            },
            message: "Which Department Would You Like To See All Employees In?"
        }
    ]).then(function(answer) {
        const department = answer.department;
        for (let i = 0; i < currentEmployees.length; i++) {
        const departmentId = getDepartmentId(currentEmployees[i].role_id)
        const employeeDepartment = getDepartment(departmentId)

            if (department === employeeDepartment) {
                employee = {
                    FirstName: currentEmployees[i].first_name,
                    LastName: currentEmployees[i].last_name,
                    Role: getRoleTitle(currentEmployees[i].role_id)
                };
                employeesToDisplay.push(employee);
            };
        };

        if (employeesToDisplay[0] == undefined) {
        console.log(chalk.magenta(`There Are No Employees In The ${department} Department`))
        start();
        } else {
        console.log(chalk.magenta(`Viewing All Employees In The ${department} Department`))
        console.table(employeesToDisplay);
        start();
        };
    });
};

function displayEmployeesByRole() {
    const employeesToDisplay = [];
    inquirer.prompt([
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
            message: "Which Role Would You Like To See All Employees In?"
        }
    ]).then(function(answer) {
        const role = answer.role;
        console.log(role);
        for (let i = 0; i < currentEmployees.length; i++) {
            const departmentId = getDepartmentId(currentEmployees[i].role_id);
            const employeeDepartment = getDepartment(departmentId);
            const firstName = currentEmployees[i].first_name;
            const lastName = currentEmployees[i].last_name;
            const employeeRole = getRoleTitle(currentEmployees[i].role_id);
            if (role == employeeRole) {
                const employee = {
                    FirstName: firstName,
                    LastName: lastName,
                    Department: employeeDepartment
                };
                employeesToDisplay.push(employee);
            };
        };
        if (employeesToDisplay[0] == undefined) {
            console.log(chalk.magenta(`There Are No Employees In The ${role} Role`))
            start();
        } else {
            console.log(chalk.magenta(`Viewing All Employees In The ${role} Role`))
            console.table(employeesToDisplay);
            start();
        };
    });
};

// FUNCTIONS FOR SECTION THREE OF OPTIONS (ADD NEW ROLE, ADD NEW DEPARTMENT)
function addNewRole() {
    inquirer.prompt([
        {
        type: "prompt",
        name: "roleTitle",
        message: "What Is The Title For The New Role You Want To Add?"
        },
        {
        type: "prompt",
        name: "roleSalary",
        message: "What Is The Salary For The New Role You Want To Add?",
        validate: function (value) {
            if (isNaN(value) === false) {
                return true;
            }
            return false;
        }
        },
        {
        type: "prompt",
        name: "roleDepartmentId",
        message: "What Is The Department Id You Want To Attach To This New Role?",
        validate: function (value) {
            if (isNaN(value) === false) {
                return true;
            }
            return false;
        }
        }
    ]).then(function(answer) {
        console.table(answer);
        const roleTitle = answer.roleTitle;
        const roleSalary = answer.roleSalary;
        const roleDepartmentId = answer.roleDepartmentId;
        const newRole = {
            title: roleTitle,
            salary: roleSalary,
            department_id: roleDepartmentId
        };
        connection.query("INSERT INTO role SET ?", newRole, function(err) {
            if (err) throw err;
            console.log(chalk.inverse("New Role Added!"));
            getCurrentRoles();
            start();
        });
    });
};

function addNewDepartment() {
    inquirer.prompt([
        {
            type: "prompt",
            name: "name",
            message: "What Is The Name Of The New Department You Want To Add?"
        }
    ]).then(function(answer) {
        console.log(answer);
        connection.query("INSERT INTO department SET ?", answer, function(err) {
            if (err) throw err;
            console.log(chalk.inverse("New Department Added!"))
            getCurrentDepartments();
            start();
        });
    });
};

// FUNCTIONS TO PULL FROM DATABASE AND SET INFO TO ARRAY
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


// FUNCTIONS TO GET INFORMATION ON EMPLOYEES BASED UPON NAME
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

function getRoleTitle(id) {
    for (let i = 0; i < currentRoles.length; i++) {
        if (id === currentRoles[i].id) {
            const title = currentRoles[i].title;
            return title
        }
    }
}

function getRoleSalary (id) {
    for (let i = 0; i < currentRoles.length; i++) {
        if (id === currentRoles[i].id) {
            const salary = currentRoles[i].salary;
            return salary;
        }
        
    }
};

function getDepartmentId(id) {
    for (let i = 0; i < currentRoles.length; i++) {
        if (id === currentRoles[i].department_id) {
            const departmentId = currentRoles[i].id;
            return departmentId;
            }
    }
};

function getDepartment(id) {
    for (let i = 0; i < currentDepartments.length; i++) {
        if (id === currentDepartments[i].id) {
            const department = currentDepartments[i].name;
            return department;
        }
    }
};
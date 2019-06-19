var mysql = require("mysql");

var inquirer = require("inquirer");

var moment = require("moment");

var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "yourRootPassword",
    database: "bamazon_db"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
    managerChoices();
});

function managerChoices() {
    inquirer.prompt([
        {
            type: "list",
            message: "What would you like to do?",
            choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Nothing for Now"],
            name: "choice"
        }
    ]).then(function (answer) {
        var choice = answer.choice;
        switch (choice) {
            case "View Products for Sale":
                viewProducts();
                break
            case "View Low Inventory":
                viewLowInventory();
                break
            case "Add to Inventory":
                addInventory();
                break
            case "Add New Product":
                addProduct();
                break
            default:
                connection.end();
        };
    });
};

function viewProducts() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            if (res[i].stock_quantity > 0) {
                console.log(`${res[i].id} - ${res[i].product_name}:\n currently available at $${res[i].price} with ${res[i].stock_quantity} in stock.`);
            }
            else {
                console.log(`${res[i].id} - ${res[i].product_name}:\n currently out of stock.`);
            }
        }
        managerChoices();
    })
}

function viewLowInventory() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        var fullyStocked = true;
        for (var i = 0; i < res.length; i++) {
            if (res[i].stock_quantity < 5) {
                console.log(`${res[i].id} - ${res[i].product_name}:\n currently only ${res[i].stock_quantity} in stock.`);
                fullyStocked = false;
            }
            else if (res[i].stock_quantity < 1) {
                console.log(`${res[i].id} - ${res[i].product_name}:\n currently out of stock.`);
                fullyStocked = false;
            }
        }
        if (fullyStocked) {
            console.log("All items in stock!")
        }
        managerChoices();
    })
}

function addInventory() {
    var itemIDs = [];
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            itemIDs.push(res[i].id);
        }
        itemIDs.push("Cancel order")
        inquirer.prompt([
            {
                type: "list",
                message: "Which item would you like to stock up on?",
                choices: itemIDs,
                name: "choice"
            }
        ]).then(function (answer) {
            var choice = answer.choice;
            if (choice == "Cancel order") {
                managerChoices();
            }
            else {
                connection.query('SELECT * FROM products WHERE ?',
                    {
                        id: choice
                    },
                    function (err, res) {
                        quantity(res[0].id, res[0].stock_quantity);
                    });
            }

        });
    });
}

function quantity(itemId, quantity) {
    inquirer.prompt([
        {
            type: "input",
            message: `How many of item ${itemId} would you like to purchase?`,
            name: "stock_added"
        }
    ]).then(function (answer) {
        var stockAdded = answer.stock_added;
        var newStock = parseInt(quantity) + parseInt(stockAdded);
        connection.query("UPDATE products SET ? WHERE ?",
            [
                {
                    stock_quantity: newStock
                },
                {
                    id: itemId
                }
            ],
            function (err, res) {
                if (err) throw err;
                var date = moment().format('MMMM Do');
                var time = moment().format('h:mm a');
                console.log(`Item ${itemId} has been restocked on ${date} at ${time}.`)
                inquirer.prompt([
                    {
                        type: "confirm",
                        message: "Would you like to stock anything else?",
                        name: "confirm"
                    }
                ]).then(function (answer) {
                    if (answer.confirm) {
                        addInventory();
                    }
                    else {
                        managerChoices();
                    }
                });
            }
        )
    })
}

function addProduct() {
    inquirer.prompt([
        {
            name: "product_name",
            message: "What is the item called?"
        }, {
            name: "department_name",
            message: "What department will be selling this item?"
        }, {
            name: "price",
            message: "How much will we charge for this item?"
        }, {
            name: "stock_quantity",
            message: "How many do you want to stock?"
        }
    ]).then(function (answer) {
        createProduct(answer.product_name, answer.department_name, answer.price, answer.stock_quantity);
    });
}

function createProduct(name, department, price, quantity) {
    console.log("Ordering a new product...\n");
    var query = connection.query(
        "INSERT INTO products SET ?",
        {
            product_name: name,
            department_name: department,
            price: price,
            stock_quantity: quantity,
        },
        function (err, res) {
            if (err) throw err;
        }
    );
    query.sql;
    console.log(`${name} added to available products!\n`);
    managerChoices();
}
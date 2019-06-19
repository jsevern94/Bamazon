var mysql = require("mysql");

var inquirer = require("inquirer");

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
    itemChoices();
});

function itemChoices() {
    var itemIDs = [];
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            if (res[i].stock_quantity > 0) {
                console.log(`${res[i].id} - ${res[i].product_name} is available for $${res[i].price}`);
                itemIDs.push(res[i].id);
            }
        }
        itemIDs.push("None of these items.")
        inquirer.prompt([
            {
                type: "list",
                message: "Which item would you like to buy?",
                choices: itemIDs,
                name: "choice"
            }
        ]).then(function (answer) {
            var choice = answer.choice;
            if (choice == "None of these items.") {
                console.log("Come back another day!");
                connection.end();
            }
            else {
                connection.query('SELECT * FROM products WHERE ?',
                    {
                        id: choice
                    },
                    function (err, res) {
                        quantity(res[0].id, res[0].price, res[0].stock_quantity);
                    });
            }

        });
    });
};

function quantity(itemId, price, stock) {
    inquirer.prompt([
        {
            type: "input",
            message: "How many would you like to purchase?",
            name: "user_quantity"
        }
    ]).then(function (answer) {
        var userQuantity = answer.user_quantity;
        if (userQuantity > stock) {
            console.log("Insufficient quantity. Try a lesser amount.");
            quantity(itemId, price, stock);
        }
        else {
            var totalPrice = price * userQuantity;
            //Makes sure that the price always shows two decimal places
            var dollarPrice = parseFloat(Math.round(totalPrice * 100) / 100).toFixed(2);
            var newStock = stock - userQuantity;
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
                    console.log(`That'll be $${dollarPrice} please.`)
                    inquirer.prompt([
                        {
                            type: "confirm",
                            message: "Would you like to buy anything else?",
                            name: "confirm"
                        }
                    ]).then(function (answer) {
                        if (answer.confirm) {
                            itemChoices();
                        }
                        else {
                            console.log("Thank you for your business, please come again!");
                            connection.end();
                        }
                    });
                }
            );
        }
    });
};
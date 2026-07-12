const express = require('express');

// ejs is a template library
// it allows us to store html in a file and then send back as response
const ejs = require('ejs');
const expressLayouts = require('express-ejs-layouts');
const app = express();

// read in our .env file
require("dotenv").config();
const { createPool } = require('mysql2/promise');

app.use(expressLayouts)
app.use(express.urlencoded({ extended: false }))

// tell Express that we are using ejs
app.set("view engine", "ejs");

// tell EJS which layout to use
app.set('layout', 'layouts/base')

// enable form submission via browser
app.use(express.urlencoded({
    extended: false
}));

// create a connection pool
const connection = createPool(
    {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT

    }
)

app.get('/', function (req, res) {

    const todayDate = new Date().toLocaleDateString("en-GB");
    // the first arg to res.render is the name
    // of the ejs file to send back to the user
    // and it will be assumed to be in the views folder
    res.render("home", {
        "todayDate": todayDate
    });
});


app.get('/customers', async function (req, res) {
    const sql = `
        SELECT * FROM Customers
            JOIN Companies ON
                Customers.company_id = Companies.company_id
        ORDER BY Customers.first_name, Customers.last_name
        `
    // connection.query takes in the SQL statement as parameter
    // and returns an array of two elements
    // index 0 is the results
    // index 1 is some metadata
    const [customers] = await connection.query({
        "sql": sql,
        "nestTables": true
    });
    // res.send(responses[0]);
    console.log(express.response[0])
    res.render('customers/index', {
        customers: customers
    })
})
// one route to display the form
app.get('/customers/create', async function (req, res) {
    const [companies] = await connection.query("SELECT * FROM Companies ORDER BY name");
    const [employees] = await connection.query("SELECT * FROM Employees ORDER BY last_name, first_name");
    const [products] = await connection.query("SELECT * FROM Products ORDER BY name");

    res.render('customers/create', {
        companies,
        employees,
        products
    });
})

// one route to process the form
app.post('/customers/create', async function (req, res) {
    // whenever
    console.log(req.body);

    const sql = `
        INSERT INTO Customers (first_name, last_name, email, company_id, employee_id)
            VALUES (?, ?, ?, ?, ?);
    `
    await connection.execute(sql, [
        req.body.first_name,
        req.body.last_name,
        req.body.email,
        req.body.company_id,
        req.body.employee_id
    ]);

    res.redirect('/customers');

    res.send("Form received");
})

// confirm with the user if they want to delete
app.get('/customers/:customer_id/delete', async function (req, res) {
    // use a prepared statement to query the database
    const [customers] = await connection.execute(
        "SELECT * FROM Customers WHERE customer_id = ?", [req.params.customer_id]);

    // connection.execute will return an array if we do a SELECT
    // so if we conly want the first result, we need to get from index 0
    const customer = customers[0];

    res.render('customers/delete', {
        customer
    })
})

// process the delete
app.post('/customers/:customer_id/delete', async function (req, res) {
    await connection.execute(
        "DELETE FROM CustomerProduct WHERE customer_id = ?",
        [req.params.customer_id]
    );

    const sql = `DELETE FROM Customers WHERE customer_id = ?`;
    await connection.execute(sql, [req.params.customer_id]);
    res.redirect('/customers');

})

// one route to display the edit form
app.get('/customers/:customer_id/update', async function (req, res) {
    // use a prepared statement to query the database
    const [customers] = await connection.execute(
        "SELECT * FROM Customers WHERE customer_id = ?", [req.params.customer_id]);

    // connection.execute will return an array if we do a SELECT
    // so if we conly want the first result, we need to get from index 0
    const customer = customers[0];

    const [companies] = await connection.execute("SELECT * FROM Companies");
    const [employees] = await connection.execute("SELECT * FROM Employees");
    const [products] = await connection.execute("SELECT * FROM Products");
    const [customerProducts] = await connection.execute(
        "SELECT product_id FROM CustomerProduct WHERE customer_id = ?",
        [req.params.customer_id]
    );
    const selectedProducts = customerProducts.map(row => row.product_id);

    res.render('customers/edit', {
        customer,
        companies,
        employees,
        products,
        selectedProducts
    })
})


// one route to process the edit form

app.listen(3000, function () {
    console.log("Server started");
})
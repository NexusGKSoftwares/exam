const express = require('express');
const path = require('path');
const app = express();
const session = require('express-session');
const mongoose = require('mongoose');




app.use(session({
    secret:'secret',
    resave:false,
    saveUninitialized:true
}));


const{check, validationResult}=require('express-validator')
const { setDefaultAutoSelectFamilyAttemptTimeout } = require('net');

mongoose.connect('mongodb://127.0.0.1:27017/final8021'); 



const Order = mongoose.model('Order',{
    name: String,
    phone: String,
    pizza: Number,
    pasta: Number,
    wings: Number
} );

const Admin = mongoose.model('Admin', {
    uname: String,
    pass: String
});


app.use(express.urlencoded({extended:false}));

//---------------- Do not modify anything above (change if it does not work) --------------------------

app.set('views', path.join(__dirname,'views'));
app.use(express.static(__dirname+'/public'));
app.set('view engine', 'ejs');



//------------- Use this space only for your routes ---------------------------
app.get('/', (req, res) => {
    res.render('index', { errors: [] }); 
});



// POST route for handling the order form
app.post('/order', async (req, res) => {
    // Extracting data from the form submission
    const { name, phone, pizza, pasta, wings } = req.body;

    // Server-side validation: ensuring the fields are not empty
    const errors = [];

    if (!name || name.trim() === "") {
        errors.push({ msg: 'Name is required.' });
    }
    if (!phone || phone.trim() === "") {
        errors.push({ msg: 'Phone number is required.' });
    }
    if (!pizza || isNaN(pizza) || pizza < 0) {
        errors.push({ msg: 'Invalid pizza quantity.' });
    }
    if (!pasta || isNaN(pasta) || pasta < 0) {
        errors.push({ msg: 'Invalid pasta quantity.' });
    }
    if (!wings || isNaN(wings) || wings < 0) {
        errors.push({ msg: 'Invalid wings quantity.' });
    }

    // If errors exist, render the form again with error messages
    if (errors.length > 0) {
        return res.render('index', { errors: errors });
    }

    // If no errors, create a new order in the database
    const newOrder = new Order({
        name,
        phone,
        pizza: parseInt(pizza),
        pasta: parseInt(pasta),
        wings: parseInt(wings),
    });

    try {
        await newOrder.save();  // Saving the order asynchronously
        // Redirect to the success page after successful order placement
        res.redirect('/success');
    } catch (err) {
        res.send('Error saving order: ' + err.message);
    }
});

// Route for success page
app.get('/success', (req, res) => {
    res.render('success');  // Rendering success.ejs template
});
app.get('/admin/login', (req, res) => {
    res.render('admin/login'); // Adjust the path to match your views folder structure
});


app.post('/admin/login', (req, res) => {
    const { uname, pass } = req.body;

    Admin.findOne({ uname: uname, pass: pass })
        .then((admin) => {
            if (admin) {
                // Store admin session
                req.session.admin = true;
                res.redirect('/admin/dashboard'); // Redirect to admin dashboard
            } else {
                res.send('Invalid username or password.');
            }
        })
        .catch((err) => {
            console.error(err);
            res.send('An error occurred. Please try again later.');
        });
});

// Admin Dashboard Route
app.get('/dashboard', (req, res) => {
    if (!req.session.admin) {
        return res.redirect('/login');
    }

    // Fetch all orders from the database
    Order.find({}, (err, orders) => {
        if (err) {
            return res.send('Error fetching orders: ' + err.message);
        }

        res.render('admin/dashboard', { orders: orders });
    });
});


app.get('/orders',async (req, res)=>{
    try {
        const orders = await Order.find();
        res.render('admin_orders', { orders });
    } catch (error) {
        console.error(error);
        res.status(500).send('Failed to retrieve orders.');
    }// use this to display all the orders when a user is logged in as admin
});

// Admin Logout Route
app.get('/admin/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.send('Error logging out: ' + err.message);
        }
        res.redirect('/admin/login');
    });
});

// write any other routes here as per your need






//---------------- Do not modify anything below this --------------------------
//------------------------ Setup the database ---------------------------------

app.get('/setup',(req, res)=>{
    
    let adminData = [{
        'uname': 'admin',
        'pass': 'admin'
    }];
    
    Admin.collection.insertMany(adminData);

    var firstNames = ['John ', 'Alana ', 'Jane ', 'Will ', 'Tom ', 'Leon ', 'Jack ', 'Kris ', 'Lenny ', 'Lucas '];
    var lastNames = ['May', 'Riley','Rees', 'Smith', 'Walker', 'Allen', 'Hill', 'Byrne', 'Murray', 'Perry'];

    let ordersData = [];

    for(i = 0; i < 10; i++){
        let tempName = firstNames[Math.floor((Math.random() * 10))] + lastNames[Math.floor((Math.random() * 10))];
        let tempOrder = {
            name: tempName,
            phone: Math.floor((Math.random() * 10000000000)),
            pizza: Math.floor((Math.random() * 10)),
            pasta: Math.floor((Math.random() * 10)),
            wings: Math.floor((Math.random() * 10))
        };
        ordersData.push(tempOrder);
    }
    
    Order.collection.insertMany(ordersData);
    res.send('Database setup complete. You can now proceed with your exam.');
    
});

//----------- Start the server -------------------

app.listen(8080);
console.log('Server started at 8080...');























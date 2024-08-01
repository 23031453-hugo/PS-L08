const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const app = express();

// Initialize balances
const initialBalances = {
    digitalWalletBalance: 0,
    savingWalletBalance: 0
};

// Function to format balance
function formatBalance(balance) {
    return balance.toFixed(2);
}

// Set up session middleware
app.use(session({
    secret: 'your-secret-key', // Replace with a strong secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set secure: true if using HTTPS
}));

// Set up view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // Add this line to parse JSON requests

// Middleware to initialize session balances if they do not exist
app.use((req, res, next) => {
    if (!req.session.balances) {
        req.session.balances = { ...initialBalances };
    }
    next();
});

// Routes
app.get('/', (req, res) => {
    const { digitalWalletBalance, savingWalletBalance } = req.session.balances;
    res.render('index', {
        digitalWalletBalance: formatBalance(digitalWalletBalance),
        savingWalletBalance: formatBalance(savingWalletBalance)
    });
});

app.post('/transfer-to-saving', (req, res) => {
    const amount = parseFloat(req.body.amount);
    const { balances } = req.session;
    if (!isNaN(amount) && balances.digitalWalletBalance >= amount) {
        balances.digitalWalletBalance -= amount;
        balances.savingWalletBalance += amount;
        req.session.balances = balances; // Update session balances
    }
    res.json({
        digitalWalletBalance: formatBalance(balances.digitalWalletBalance),
        savingWalletBalance: formatBalance(balances.savingWalletBalance)
    }); // Respond with updated balances
});

app.post('/transfer-to-digital', (req, res) => {
    const amount = parseFloat(req.body.amount);
    const { balances } = req.session;
    if (!isNaN(amount) && balances.savingWalletBalance >= amount) {
        balances.savingWalletBalance -= amount;
        balances.digitalWalletBalance += amount;
        req.session.balances = balances; // Update session balances
    }
    res.json({
        digitalWalletBalance: formatBalance(balances.digitalWalletBalance),
        savingWalletBalance: formatBalance(balances.savingWalletBalance)
    }); // Respond with updated balances
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});

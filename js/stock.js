// ----------------------Buttons-----------------------
// Elements for buttons to trigger various actions
const newProductBtn = document.getElementById('newProductBtn'); // Button to open the "Add Product" popup
const cancelProductBtn = document.getElementById('cancelProductBtn'); // Button to cancel adding a product
const createBtn = document.getElementById('createBtn'); // Button to create a new stock entry
const cancelEditBtn = document.getElementById('cancelEditBtn'); // Button to cancel editing a stock entry
const saveBtn = document.getElementById('saveBtn'); // Button to save changes to an edited stock entry
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn'); // Button to cancel deleting a stock entry
const deleteBtn = document.getElementById('deleteBtn'); // Button to delete a stock entry

// Icons for closing popups
const closeiconProduct = document.getElementById('closeiconProduct'); // Close icon for the add product popup
const closeiconEdit = document.getElementById('closeiconEdit'); // Close icon for the edit product popup
const closeiconDelete = document.getElementById('closeiconDelete'); // Close icon for the delete product popup
const StockAddBtn = document.getElementById('StockAddBtn'); // Button to add a selected product to the stock

// Pop-up containers for different operations
const addPop = document.getElementById('addPop'); // Pop-up for adding a new stock entry
const editPop = document.getElementById('editPop'); // Pop-up for editing an existing stock entry
const deletePop = document.getElementById('deletePop'); // Pop-up for confirming the deletion of a stock entry

// Form input fields
const search = document.getElementById('Search'); // Input field for searching suppliers by name
const editProduct = document.getElementById('editProduct'); // Input field for editing the product in the edit popup
const supplier = document.getElementById('supplier'); // Input field for entering the supplier name
const deliveryDate = document.getElementById('deliveryDate'); // Input field for selecting the delivery date
const supplierShow = document.getElementById('supplierShow'); // Display supplier name in the edit popup
const deliveryDateShow = document.getElementById('deliveryDateShow'); // Display delivery date in the edit popup
const choseProduct = document.getElementById('choseProduct'); // Dropdown for selecting a product
const quantity = document.getElementById('quantity'); // Input field for entering the quantity of the selected product

// Set default date to current date when the page loads
function DOMContentLoaded() {
    if (deliveryDate) {
        const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
        deliveryDate.value = today; // Set the default value of deliveryDate to today's date
    }
}
DOMContentLoaded(); // Initialize the default date

// ----------------------Popup Handling-----------------------
// Open the add product popup and close others
newProductBtn.onclick = function () {
    addPop.classList.remove('d-none'); // Show the "Add Product" popup
    editPop.classList.add('d-none'); // Hide the "Edit Product" popup
    deletePop.classList.add('d-none'); // Hide the "Delete Product" popup
    populateProductDropdown(products); // Populate the product dropdown list in the add popup
    DOMContentLoaded(); // Set the default delivery date

};

// Function to close all popups
function closepop() {
    addPop.classList.add('d-none'); // Hide the "Add Product" popup
    editPop.classList.add('d-none'); // Hide the "Edit Product" popup
    deletePop.classList.add('d-none'); // Hide the "Delete Product" popup
}

// Assign the close function to multiple close buttons/icons
[cancelProductBtn, closeiconProduct, cancelEditBtn, closeiconEdit, cancelDeleteBtn, closeiconDelete]
    .forEach(btn => btn.onclick = closepop); // Close popups when these elements are clicked


// ----------------------POST STOCK---------------------
// Function to handle creating a new stock entry
createBtn.onclick = async function () {
    // Check if supplier input is empty, and add a validation error class if true
    if (supplier.value.trim() === '') {
        supplier.classList.add('is-invalid'); // Add 'is-invalid' class to supplier input for visual feedback
        return;
    }

    // Collect product details (product name and quantity) from the popup table
    const articles = [];
    const rows = document.querySelectorAll('#poptbody tr');  // Get all rows in the popup table
    let invalidQuantity = false; // Flag to check for invalid quantity

    rows.forEach(row => {
        const productTitle = row.querySelector('td:nth-child(1)').textContent;
        const quantity = parseInt(row.querySelector('td:nth-child(2)').textContent, 10);
        const productId = products.find(p => p.title === productTitle)?.id; // Get product ID by matching title

        if (productId) {
            if (quantity < 1 || isNaN(quantity)) {
                invalidQuantity = true; // Set flag if quantity is invalid
            } else {
                articles.push({ product: productId, quantity });
            }
        }
    });

    // If any product has a quantity < 1, show an alert and stop execution
    if (invalidQuantity) {
        alert("Quantity must be at least 1.");
        return;
    }

    // If no articles are selected, show an alert
    if (articles.length === 0) {
        alert("Please add at least one product to the stock.");
        return;
    }

    addPop.classList.add('d-none'); // Close the "Add Product" popup

    // Prepare the stock data object for sending to the backend
    const stockData = {
        name: supplier.value.trim(), // Supplier name
        date: deliveryDate.value, // Delivery date
        articles: articles // Articles (products and quantities)
    };

    try {
        // Send the stock data to the server using a POST request
        const response = await fetch('http://localhost:3000/stock-operations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(stockData), // Convert stock data to JSON
        });
        if (!response.ok) throw new Error('Failed to add stock');
        const data = await response.json(); // Parse the response as JSON
        console.log("Stock added:", data);
        await fetchStock(); // Refresh the stock list
        // Clear input fields and reset the popup table
        supplier.value = '';
        deliveryDate.value = '';
        choseProduct.value = ''; // Clear the product selection dropdown
        quantity.value = ''; // Clear the quantity input
        document.getElementById('poptbody').innerHTML = ''; // Clear the table in the popup
    } catch (error) {
        console.error("Error adding stock:", error); // Log any error that occurs
    }
};

// ----------------------GET STOCK-----------------------
// Array to store the fetched stock entries
let stocks = [];

// Function to fetch stock entries from the server
async function fetchStock() {
    try {
        const response = await fetch('http://localhost:3000/stock-operations');
        if (!response.ok) throw new Error('Failed to fetch data');
        stocks = await response.json(); // Store the fetched data in 'stocks' array
        displayStock(stocks); // Call function to display the fetched stock data in the table
    } catch (error) {
        console.error("Error fetching stocks:", error); // Log any error that occurs
    }
}
fetchStock(); // Fetch stock data when the page loads

// ------------------Display stock (Main Table)-----------------
// Function to display the fetched stock data in the main table
function displayStock(stocksToShow) {
    let table = ""; // Initialize an empty string to build the table rows
    stocksToShow.forEach((stock, index) => { // Add index as the second parameter
        let dateObj = new Date(stock.date); // Convert stock date to Date object
        let formattedDate = `${(dateObj.getMonth() + 1).toString().padStart(2, '0')}-${dateObj.getDate().toString().padStart(2, '0')}-${dateObj.getFullYear()}`; // Format the date

        table += `
            <tr>
                <td>${index + 1}</td> <!-- Display row number -->
                <td>${stock.name}</td>
                <td>${formattedDate}</td>
                <td>${stock.articles.length}</td>
                <td>
                    <button onclick="openDetailspop('${stock._id}')" class="btn btn-primary mx-2">
                        <i class="fa-solid fa-eye"></i>
                    </button>
                    <button onclick="openDeletepop('${stock._id}')" class="btn btn-danger mx-2">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    document.getElementById('tbody').innerHTML = table; // Insert the generated table rows into the tbody
}

// ----------------------GET PRODUCTS-----------------------
// Array to store the fetched products
let products = [];

// Function to fetch products from the server
async function fetchProducts() {
    try {
        const response = await fetch('http://localhost:3000/products');
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        products = await response.json(); // Store the fetched products in 'products' array
        populateProductDropdown(products); // Populate the product dropdown in the add popup
    } catch (error) {
        console.error("Error fetching products:", error); // Log any error that occurs
    }
}
fetchProducts(); // Fetch products when the page loads

// ----------------------Display Popup Products------------------
// Function to populate the product dropdown in the add stock popup
function populateProductDropdown(productsList) {
    choseProduct.innerHTML = '<option value="">Select a product</option>'; // Clear the dropdown and add the default option

    productsList.forEach(product => {
        let option = document.createElement('option');
        option.value = product.id; // Set the value as the product ID
        option.textContent = product.title; // Set the display text as the product title
        choseProduct.appendChild(option); // Append the option to the dropdown
    });
}

function displayPopTableProduct() {
    const quantityValue = parseInt(quantity.value, 10); // Convert quantity input to a number
    const selectedProduct = choseProduct.options[choseProduct.selectedIndex].text;

    // Check if quantity is empty, zero, or less than 1, or if no product is selected
    if (isNaN(quantityValue) || quantityValue < 1 || choseProduct.value === "") {
        quantity.classList.add('is-invalid'); // Highlight invalid input
        choseProduct.classList.add('is-invalid'); // Highlight invalid selection
        return; // Stop function execution
    }

    // If input is valid, remove invalid class
    quantity.classList.remove('is-invalid');
    choseProduct.classList.remove('is-invalid');

    let tableBody = document.getElementById('poptbody');
    let rows = tableBody.querySelectorAll('tr');
    let productExists = false;

    // Loop through table rows to check if the product already exists
    rows.forEach(row => {
        let productCell = row.querySelector('td:nth-child(1)'); // First column (product name)
        let quantityCell = row.querySelector('td:nth-child(2)'); // Second column (quantity)

        if (productCell.textContent === selectedProduct) {
            // Product exists, update its quantity
            let currentQuantity = parseInt(quantityCell.textContent, 10);
            quantityCell.textContent = currentQuantity + quantityValue; // Update quantity
            productExists = true;
        }
    });

    // If product does not exist, add a new row
    if (!productExists) {
        let tableRow = `
            <tr>
                <td>${selectedProduct}</td>
                <td>${quantityValue}</td>
                <td></td>
                <td></td>
                <td>    
                    <i onclick="removeRow(this)" class="fa-solid fa-x" style="font-size: 10px; color: rgb(26, 26, 26);"></i>   
                </td>
            </tr>
        `;
        tableBody.innerHTML += tableRow; // Append new row
    }

    // Clear input fields
    choseProduct.value = "";
    quantity.value = "";
}

// Set the click event to add a product to the popup table
StockAddBtn.onclick = displayPopTableProduct;

// Function to remove a row from the popup table
function removeRow(button) {
    button.closest('tr').remove(); // Remove the closest table row of the clicked button
}


// -----------------------------Show Details Popup--------------
// Function to open the details popup and display stock info
function openDetailspop(stockId) {

    scrollToTop();
    console.log("Opening details popup for stock ID:", stockId);

    editPop.classList.remove('d-none');
    addPop.classList.add('d-none');
    deletePop.classList.add('d-none');

    let stock = stocks.find(s => s._id === stockId); // Find stock by ID
    let secondPoptbody = document.getElementById('secondPoptbody');

    supplierShow.value = stock.name;

    let dateObj = new Date(stock.date);
    let formattedDate = `${(dateObj.getMonth() + 1).toString().padStart(2, '0')}-${dateObj.getDate().toString().padStart(2, '0')}-${dateObj.getFullYear()}`;
    deliveryDateShow.value = formattedDate;

    secondPoptbody.innerHTML = '';

    console.log("Stock articles:", stock.articles);

    if (!stock.articles || stock.articles.length === 0) {
        console.log("No articles found in this stock.");
        secondPoptbody.innerHTML = '<tr><td colspan="2" class="text-center">No products found</td></tr>';
        return;
    }

    stock.articles.forEach(article => {
        console.log("Article data:", article);

        // Directly access the title if `product` is an object
        let productName = article.product && article.product.title ? article.product.title : "Unknown Product";

        console.log(`Adding row: ${productName} - ${article.quantity}`);

        let row = `
            <tr>
                <td>${productName}</td>
                <td>${article.quantity}</td>
                <td></td>
                <td></td>
            </tr>
        `;
        secondPoptbody.innerHTML += row;
    });
}

// -----------------------------DELETE------------------------
// Function to open the delete popup and handle stock deletion
function openDeletepop(stockId) {
    scrollToTop();
    deletePop.classList.remove('d-none'); // Show delete popup
    addPop.classList.add('d-none'); // Hide add popup
    editPop.classList.add('d-none'); // Hide edit popup

    let deleteP = document.getElementById('deleteP');
    let deleteD = document.getElementById('deleteD');

    // Get the selected stock details
    let stock = stocks.find(s => s._id === stockId); // Find stock by ID

    if (!stock || !stock._id) {
        console.error("Invalid stock data:", stock);
        alert("Error: Unable to delete stock.");
        return;
    }

    // Format the date
    let dateObj = new Date(stock.date);
    let formattedDate = `${(dateObj.getMonth() + 1).toString().padStart(2, '0')}-${dateObj.getDate().toString().padStart(2, '0')}-${dateObj.getFullYear()}`;

    // Display the name and date in the delete confirmation popup
    deleteP.innerText = stock.name;
    deleteD.innerText = formattedDate;

    // Set up the delete button with a one-time event listener
    deleteBtn.onclick = async function () {
        try {
            const response = await fetch(`http://localhost:3000/stock-operations/${stock._id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete stock');
            const data = await response.json();
            console.log("Stock deleted:", data);

            // Refresh stock list
            await fetchStock();

            // Close the delete popup
            deletePop.classList.add('d-none');

        } catch (error) {
            console.error("Error deleting stock:", error);
            alert("Error: Unable to delete stock.");
        }
    };
}

// -------------------------Search for Supplier----------------------------
// Event listener to filter stocks by supplier name
search.addEventListener('input', () => {
    let query = search.value.toLowerCase().trim(); // Get the search query in lowercase
    displayStock(stocks.filter(stock => stock.name.toLowerCase().includes(query))); // Filter and display stocks based on search
});
// ----------------------scroll top-----------------------
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}


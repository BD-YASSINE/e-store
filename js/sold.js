// ----------------------Buttons-----------------------
// Elements for buttons to trigger various actions
const newProductBtn = document.getElementById('newProductBtn');
const cancelProductBtn = document.getElementById('cancelProductBtn');
const createBtn = document.getElementById('createBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const saveBtn = document.getElementById('saveBtn');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const deleteBtn = document.getElementById('deleteBtn');

const closeiconProduct = document.getElementById('closeiconProduct');
const closeiconEdit = document.getElementById('closeiconEdit');
const closeiconDelete = document.getElementById('closeiconDelete');
const StockAddBtn = document.getElementById('StockAddBtn');

// Pop-up containers for different operations
const addPop = document.getElementById('addPop');
const editPop = document.getElementById('editPop');
const deletePop = document.getElementById('deletePop');

// Form input fields
const search = document.getElementById('Search');
const editProduct = document.getElementById('editProduct');
const supplier = document.getElementById('supplier');
const deliveryDate = document.getElementById('deliveryDate');
const supplierShow = document.getElementById('supplierShow');
const deliveryDateShow = document.getElementById('deliveryDateShow');
const choseProduct = document.getElementById('choseProduct');
const quantity = document.getElementById('quantity');

// Set default date to current date when the page loads
function DOMContentLoaded() {
    if (deliveryDate) {
        const today = new Date().toISOString().split('T')[0];
        deliveryDate.value = today;
    }
}
document.addEventListener('DOMContentLoaded', DOMContentLoaded);

// ----------------------Popup Handling-----------------------
// Open the add product popup and close others
newProductBtn.onclick = function () {
    addPop.classList.remove('d-none');
    editPop.classList.add('d-none');
    deletePop.classList.add('d-none');
    populateProductDropdown(products);
    DOMContentLoaded();
};

// Function to close all popups
function closepop() {
    addPop.classList.add('d-none');
    editPop.classList.add('d-none');
    deletePop.classList.add('d-none');
}

// Assign the close function to multiple close buttons/icons
[cancelProductBtn, closeiconProduct, cancelEditBtn, closeiconEdit, cancelDeleteBtn, closeiconDelete]
    .forEach(btn => btn.onclick = closepop);

// ----------------------POST Sells---------------------
// Function to handle creating a new stock entry
createBtn.onclick = async function () {
    // Check if supplier name is empty and apply invalid class
    if (supplier.value.trim() === '') {
        supplier.classList.add('is-invalid');
        alert("Supplier name is required.");
        return;  // Stop execution if validation fails
    }

    const articles = [];
    const rows = document.querySelectorAll('#poptbody tr');  // Get all rows in the popup table

    rows.forEach(row => {
        const productTitle = row.querySelector('td:nth-child(1)').textContent;  // Product name
        const quantity = parseInt(row.querySelector('td:nth-child(2)').textContent, 10);  // Quantity

        // Skip if quantity is less than 1
        if (quantity < 1) return;

        const productId = products.find(p => p.title === productTitle)?.id;  // Get product ID

        // If both productId and quantity are valid, add to articles array
        if (productId && quantity) {
            articles.push({ product: productId, quantity: quantity });
        }
    });

    // If no articles have been added, show an alert and stop the process
    if (articles.length === 0) {
        alert("Please add at least one valid product to the stock.");
        return;
    }

    // Hide the popup after validating
    addPop.classList.add('d-none');

    // Prepare the stock data object to send to the backend
    const stockData = {
        name: supplier.value.trim(),
        date: deliveryDate.value,
        articles: articles
    };

    try {
        // Send the stock data to the backend via POST request
        const response = await fetch('http://localhost:3000/sell-operations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(stockData),
        });

        // Check if the response is OK (status code 200-299)
        if (!response.ok) {
            const errorMessage = await response.text();  // Get error message from server response
            throw new Error(`Failed to add sells: ${errorMessage}`);
        }

        const data = await response.json();
        console.log("Stock added:", data);

        // Refresh the stock data
        await fetchStock();

        // Reset the form and clear table after success
        supplier.value = '';
        deliveryDate.value = '';
        choseProduct.value = '';
        quantity.value = '';
        document.getElementById('poptbody').innerHTML = '';

    } catch (error) {
        console.error("Error adding sells:", error);
        alert(`An error occurred while adding the sells: ${error.message}`);
    }
};


// ----------------------GET Sells-----------------------
let stocks = [];

async function fetchStock() {
    try {
        const response = await fetch('http://localhost:3000/sell-operations');
        if (!response.ok) throw new Error('Failed to fetch data');
        stocks = await response.json();
        displayStock(stocks);
    } catch (error) {
        console.error("Error fetching stocks:", error);
        alert("An error occurred while fetching the stock data. Please try again.");
    }
}
fetchStock();

// ------------------Display sells (Main Table)-----------------
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
let products = [];

async function fetchProducts() {
    try {
        const response = await fetch('http://localhost:3000/products');
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        products = await response.json();
        populateProductDropdown(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        alert("An error occurred while fetching the products. Please try again.");
    }
}
fetchProducts();

// ----------------------Display Popup Products------------------
function populateProductDropdown(productsList) {
    choseProduct.innerHTML = '<option value="">Select a product</option>';

    productsList.forEach(product => {
        let option = document.createElement('option');
        option.value = product.id;
        option.textContent = product.title;
        choseProduct.appendChild(option);
    });
}

// ----------------------Display Popup Products in table------------------
function displayPopTableProduct() {
    const quantityValue = parseInt(quantity.value, 10); // Convert quantity input to a number

    // If quantity is less than 1 or input is invalid, stop function and highlight invalid input
    if (isNaN(quantityValue) || quantityValue < 1 || choseProduct.value === "") {
        quantity.classList.add('is-invalid');
        choseProduct.classList.add('is-invalid');
        return; // Stop function execution
    }

    // Remove invalid class if inputs are valid
    quantity.classList.remove('is-invalid');
    choseProduct.classList.remove('is-invalid');

    const selectedProduct = choseProduct.options[choseProduct.selectedIndex].text;
    let tableBody = document.getElementById('poptbody');
    let rows = tableBody.querySelectorAll('tr');
    let productExists = false;

    // Loop through rows to check if the product already exists in the table
    rows.forEach(row => {
        let productCell = row.querySelector('td:nth-child(1)'); // Product name cell
        let quantityCell = row.querySelector('td:nth-child(2)'); // Quantity cell

        // If the product exists, update its quantity
        if (productCell.textContent === selectedProduct) {
            let currentQuantity = parseInt(quantityCell.textContent, 10);
            quantityCell.textContent = currentQuantity + quantityValue; // Update quantity
            productExists = true; // Flag indicating the product exists
        }
    });

    // If the product doesn't exist, add a new row to the table
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
        tableBody.innerHTML += tableRow; // Append the new row to the table
    }

    // Clear input fields after adding/updating
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
function openDetailspop(stockId) {
    scrollToTop()
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

    if (!stock.articles || stock.articles.length === 0) {
        secondPoptbody.innerHTML = '<tr><td colspan="2" class="text-center">No products found</td></tr>';
        return;
    }

    stock.articles.forEach(article => {
        let productName = article.product && article.product.title ? article.product.title : "Unknown Product";
        let row = `
            <tr>
                <td>${productName}</td>
                <td>${article.quantity}</td>
                <td></td>
            </tr>
        `;
        secondPoptbody.innerHTML += row;
    });
}

// -----------------------------DELETE------------------------
function openDeletepop(stockId) {

    scrollToTop()                              
    deletePop.classList.remove('d-none');
    addPop.classList.add('d-none');
    editPop.classList.add('d-none');

    let deleteP = document.getElementById('deleteP');
    let deleteD = document.getElementById('deleteD');

    let stock = stocks.find(s => s._id === stockId); // Find stock by ID

    let dateObj = new Date(stock.date);
    let formattedDate = `${(dateObj.getMonth() + 1).toString().padStart(2, '0')}-${dateObj.getDate().toString().padStart(2, '0')}-${dateObj.getFullYear()}`;

    deleteP.innerText = stock.name;
    deleteD.innerText = formattedDate;

    deleteBtn.onclick = async function () {
        try {
            const response = await fetch(`http://localhost:3000/sell-operations/${stock._id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete stock');
            const data = await response.json();
            console.log("Stock deleted:", data);
            await fetchStock();
            deletePop.classList.add('d-none');
        } catch (error) {
            console.error("Error deleting stock:", error);
            alert("An error occurred while deleting the stock. Please try again.");
        }
    };
}

// -------------------------Search for Client----------------------------
search.addEventListener('input', () => {
    let query = search.value.toLowerCase().trim();
    displayStock(stocks.filter(stock => stock.name.toLowerCase().includes(query)));
});

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}


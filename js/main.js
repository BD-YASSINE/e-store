// ----------------------Buttons, Icons, Inputs-----------------------
// Buttons
const newProductBtn = document.getElementById('newProductBtn');
const cancelProductBtn = document.getElementById('cancelProductBtn');
const createBtn = document.getElementById('createBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const saveBtn = document.getElementById('saveBtn');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const deleteBtn = document.getElementById('deleteBtn');

// Icons
const closeiconProduct = document.getElementById('closeiconProduct');
const closeiconEdit = document.getElementById('closeiconEdit');
const closeiconDelete = document.getElementById('closeiconDelete');

// Pop-ups
const addPop = document.getElementById('addPop');
const editPop = document.getElementById('editPop');
const deletePop = document.getElementById('deletePop');

// Inputs
const search = document.getElementById('Search');
const Product = document.getElementById('Product');
const editProduct = document.getElementById('editProduct');

// ----------------------Popup Handling-----------------------
newProductBtn.onclick = function () {
    addPop.classList.remove('d-none');
    editPop.classList.add('d-none');
    deletePop.classList.add('d-none');
};

function closepop() {
    addPop.classList.add('d-none');
    editPop.classList.add('d-none');
    deletePop.classList.add('d-none');
}

cancelProductBtn.onclick = closepop;
closeiconProduct.onclick = closepop;
cancelEditBtn.onclick = closepop;
closeiconEdit.onclick = closepop;
cancelDeleteBtn.onclick = closepop;
closeiconDelete.onclick = closepop;

// ----------------------GET-----------------------
let products = [];

function fetchProducts() {
    fetch('http://localhost:3000/products')
        .then(response => response.json())
        .then(json => {
            products = json;
            displayProducts(products);
        })
        .catch(error => console.error("Error fetching products:", error));
}

fetchProducts();

// ------------------Display Products-----------------
function displayProducts(productsToShow) {
    let table = "";
    productsToShow.forEach((product, index) => { // Include index as the second parameter
        table += `
            <tr>
                <td>${index + 1}</td>
                <td>${product.title}</td> 
                <td>${product.stock_available} Unités</td> 
                <td>${product.sells} Unités</td>
                <td>
                    <button onclick="openEditpop('${product._id}')" class="btn btn-primary mx-2">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button onclick="openDeletepop('${product._id}')" class="btn btn-danger mx-2">
                        <i class="fa-solid fa-trash"></i> 
                    </button>
                </td>
            </tr>
        `;
    });
    document.getElementById('tbody').innerHTML = table;
}

// -----------------------POST---------------------
createBtn.onclick = function () {
    if (Product.value.trim() === '') {
        Product.classList.add('is-invalid');
    } else {
        addPop.classList.add('d-none');

        const productData = { title: Product.value.trim() };

        fetch('http://localhost:3000/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData),
        })
            .then(response => response.json())
            .then(() => {
                fetchProducts();
                Product.value = '';
            })
            .catch(error => console.error("Error adding product:", error));
    }
};

// -----------------------PUT-------------------------
function openEditpop(id) {
    scrollToTop()
    const product = products.find(p => p._id === id);
    if (!product) return;

    editPop.classList.remove('d-none');
    addPop.classList.add('d-none');
    deletePop.classList.add('d-none');
    editProduct.value = product.title;

    saveBtn.onclick = function () {
        if (editProduct.value.trim() === '') {
            editProduct.classList.add('is-invalid');
        } else {
            editPop.classList.add('d-none');
            const updatedProduct = { title: editProduct.value.trim() };

            fetch(`http://localhost:3000/products/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedProduct),
            })
                .then(response => response.json())
                .then(() => fetchProducts())
                .catch(error => console.error("Error updating product:", error));
        }
    };
}

// -----------------------------DELETE------------------------
function openDeletepop(id) {
    scrollToTop()
    const product = products.find(p => p._id === id);
    if (!product) return;

    deletePop.classList.remove('d-none');
    addPop.classList.add('d-none');
    editPop.classList.add('d-none');
    document.getElementById('deleteP').innerText = product.title;

    deleteBtn.onclick = function () {
        fetch(`http://localhost:3000/products/${id}`, { method: 'DELETE' })
            .then(response => response.json())
            .then(() => {
                fetchProducts();
                deletePop.classList.add('d-none');
            })
            .catch(error => console.error("Error deleting product:", error));
    };
}

// -------------------------Search for Product----------------------------
search.addEventListener('input', function () {
    let query = search.value.toLowerCase().trim();
    let filteredProducts = products.filter(product => product.title.toLowerCase().includes(query));
    displayProducts(filteredProducts);
});

// ----------------------scroll top-----------------------
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}


// Get references of the elements in JavaScript
const groceryItemForm = document.querySelector('#grocery-item-form');
const groceryItemName = document.querySelector('#grocery-item-name');
const groceryItemDescription = document.querySelector('#grocery-item-description');
const addItemButton = document.querySelector('#add-item-btn');
const filterItemsInput = document.querySelector('#filter');
const groceryList = document.querySelector('.item-list');
const clearListButton = document.querySelector('#clear-list-btn');
const cancelButton = document.querySelector('#cancel-btn');
const editButton = document.querySelector('#edit-btn');
const groceryModeTitle = document.querySelector('#grocery-mode-title');

let itemIdCounter = 0;

// Load all event listeners
loadEventListeners();

function loadEventListeners() {
	// Retrieve Items on Load Event Listener
	document.addEventListener('DOMContentLoaded', init);

	// Add Item Event Listener
	groceryItemForm.addEventListener('submit', addItemToList);

	// Clear List Event Listener
	clearListButton.addEventListener('click', clearItemsFromList);

	// Edit Item Event Listener
	editButton.addEventListener('click', confirmEdit);

	// Cancel Edit Event Listener
	cancelButton.addEventListener('click', cancelEditMode);

	// Filter Input Event Listener
	filterItemsInput.addEventListener('input', filterItems);
}

function init() {
	groceryItemForm.setAttribute('mode', 'add');

	retrieveItems();
}

// Add items to list
function addItemToList(e) {
	const mode = groceryItemForm.getAttribute('mode');

	// Check if in edit mode
	if (mode === 'edit') {
		confirmEdit(e);
		return;
	}

	// Retrieve values for name and description
	let itemName = groceryItemName.value;
	let itemDescription = groceryItemDescription.value;

	// Check for blank inputs
	if (itemName === '' || itemDescription === '') {
		alert('You have to fill all information to add a new item! Try again.');

		e.preventDefault();
		return;
	}

	createItem(itemName, itemDescription);

	groceryItemName.value = '';
	groceryItemDescription.value = '';

	saveItemToLocalStorage({ name: itemName, description: itemDescription, id: itemIdCounter });

	itemIdCounter++;
	e.preventDefault();
}

// Create item helper function
function createItem(itemName, itemDescription, itemId = null) {
	// Create new item
	const li = document.createElement('li');
	li.className = 'collection-item';
	li.style = 'display: flex; align-items: center; justify-content: space-between;';
	itemId === null ? li.id = `item-${itemIdCounter}` : li.id = `item-${itemId}`;

	// Add a template in the item
	li.innerHTML = `
        <div class="item-info">
            <h5 class="item-name">${itemName}</h5>
            <span class="item-description">${itemDescription}</span>
        </div>
    `;

	// Create remove button and properties
	const removeButton = document.createElement('a');
	removeButton.innerHTML = '<i class="fa fa-remove"></i>';
	removeButton.style = 'cursor: pointer;';
	removeButton.classList = 'delete-item secondary-content';

	// Create remove button and properties
	const editButton = document.createElement('a');
	editButton.innerHTML = '<i class="fa fa-edit"></i>';
	editButton.style = 'cursor: pointer;';
	editButton.classList = 'edit-item secondary-content';

	// Add an event listener to buttons
	removeButton.addEventListener('click', removeItemFromList);
	editButton.addEventListener('click', editItemFromList);

	// Create a container for the buttons
	const buttonContainer = document.createElement('div');
	buttonContainer.classList = 'button-container';

	// Append buttons to container
	buttonContainer.appendChild(removeButton);
	buttonContainer.appendChild(editButton);

	// Append button container to item
	li.appendChild(buttonContainer);

	// Add item to list
	groceryList.appendChild(li);
}

// Remove item from list
function removeItemFromList(e) {

	if (e.target.parentElement.classList.contains('delete-item')) {
		if (confirm('Are you sure?')) {
			let groceryItem = e.target.parentElement.parentElement.parentElement;

			groceryItem.remove();

			removeItemFromLocalStorage(groceryItem.id.split('-')[1]);
		}
	}

	e.preventDefault();
}

// Edit items from list
function editItemFromList(e) {
	let groceryItem = null;

	if (e.target.parentElement.classList.contains('edit-item')) {
		groceryItem = e.target.parentElement.parentElement.parentElement;


		// Toggle edit mode
		groceryItemForm.setAttribute('mode', 'edit');
		onModeToggle(groceryItem);
	}

	e.preventDefault();
}

function onModeToggle(groceryItem) {
	const mode = groceryItemForm.getAttribute('mode');

	// Change form title
	groceryModeTitle.innerHTML = mode === 'edit' ? 'Edit Grocery Item' : 'Add Grocery Item';

	// Hide add mode buttons
	addItemButton.style.visibility = mode === 'edit' ? 'hidden' : 'visible';
	addItemButton.style.display = mode === 'edit' ? 'none' : 'initial';

	mode === 'edit' ? groceryItemForm.setAttribute('currentItemId', groceryItem.id) : groceryItemForm.removeAttribute('currentItemId');

	// Show edit mode buttons
	cancelButton.style.visibility = mode === 'edit' ? 'visible' : 'hidden';
	editButton.style.visibility = mode === 'edit' ? 'visible' : 'hidden';

	// Populate inputs with item info / clear inputs
	if (mode === 'edit') {
		groceryItemName.value = groceryItem.querySelector('.item-name').innerHTML;
		groceryItemDescription.value = groceryItem.querySelector('.item-description').innerHTML;
	} else {
		groceryItemName.value = '';
		groceryItemDescription.value = '';
	}
}

// Confirm edit on item
function confirmEdit(e) {
	const currentItemId = groceryItemForm.getAttribute('currentItemId');

	const itemToEdit = groceryList.querySelector(`#${currentItemId}.collection-item`);

	// Retrieve values for name and description
	let itemName = groceryItemName.value;
	let itemDescription = groceryItemDescription.value;

	// Check for blank inputs
	if (itemName === '' || itemDescription === '') {
		alert('You have to fill all information to add a new item! Try again.');

		e.preventDefault();
		return;
	}

	itemToEdit.querySelector('.item-name').innerHTML = itemName;
	itemToEdit.querySelector('.item-description').innerHTML = itemDescription;

	// Toggle add mode
	groceryItemForm.setAttribute('mode', 'add');
	onModeToggle();

	e.preventDefault();
}

// Cancel edit mode
function cancelEditMode(e) {
	groceryItemForm.setAttribute('mode', 'add');
	onModeToggle();

	e.preventDefault();
}


// Clear items from list
function clearItemsFromList() {
	while (groceryList.firstChild) {
		groceryList.firstChild.remove();
	}

	clearItemsFromLocalStorage();
}

// Filter items
function filterItems(e) {
	const filterValue = e.target.value.toLowerCase();

	groceryList.querySelectorAll('.collection-item').forEach(function (item) {
		const itemName = item.querySelector('.item-name').innerHTML.toLowerCase();

		if (itemName.indexOf(filterValue) != -1) {
			item.style.display = 'flex';
		} else {
			item.style.display = 'none';
		}
	})
}


// Save item to Local Storage
function saveItemToLocalStorage(item) {

	let groceryItems = localStorage.getItem('groceryItems');

	if (groceryItems !== null) {
		groceryItems = JSON.parse(groceryItems);
	} else {
		groceryItems = {};
	}

	groceryItems[item.id] = { name: item.name, description: item.description, id: item.id };

	localStorage.setItem('groceryItems', JSON.stringify(groceryItems));
}

// Remove item from Local Storage
function removeItemFromLocalStorage(id) {
	let groceryItems = localStorage.getItem('groceryItems');

	if (groceryItems !== null) {
		groceryItems = JSON.parse(groceryItems);
	} else {
		groceryItems = {};
	}

	if (groceryItems[id]) {
		delete groceryItems[id];
		localStorage.setItem('groceryItems', JSON.stringify(groceryItems));
	}
}

// Clear items from Local Storage
function clearItemsFromLocalStorage() {
	localStorage.clear();
}

// Retrieve items from Local Storage on load
function retrieveItems() {
	let groceryItems = localStorage.getItem('groceryItems');

	if (groceryItems !== null) {
		groceryItems = JSON.parse(groceryItems);
	} else {
		groceryItems = {};
	}

	for (let id in groceryItems) {
		createItem(groceryItems[id].name, groceryItems[id].description, groceryItems[id].id);
	}

	if (groceryList.children.length > 0) {
		itemIdCounter = Number(groceryList.lastChild.getAttribute('id').replace('item-', '')) + 1;
	}
}
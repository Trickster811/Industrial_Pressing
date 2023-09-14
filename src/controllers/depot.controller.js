let n = 1;

// Function to update clothe info in a row
function update_clothe_info(element) {
  update_total();
}

// Function to update the total amount to pay
function update_total() {
  let total = 0;
  for (let index = 1; index <= n; index++) {
    total += parseInt(
      document.getElementById("clothe_priceUnitary" + index).value
    );
  }
  document.getElementById("total_to_pay").value = total;
  update_remaining_to_pay();
}

// Function to update remaining amount to pay
function update_remaining_to_pay() {
  document.getElementById("amount_paid").value =
    document.getElementById("total_to_pay").value -
    document.getElementById("remaining_to_pay").value;
}

// Function to add row in a table
function AddRow() {
  n++;

  var table = document.getElementById("clothes_details");
  var row = table.insertRow(n);
  var cell1 = row.insertCell(0);
  var cell2 = row.insertCell(1);
  var cell3 = row.insertCell(2);
  var cell4 = row.insertCell(3);
  var cell5 = row.insertCell(4);
  var cell6 = row.insertCell(5);

  cell1.innerHTML =
    '<input id="clothe_code' +
    n +
    '" type="text" class="form-control" value="code" disabled/>';
  cell2.innerHTML =
    '<input id="clothe_type' +
    n +
    '" type="text" class="form-control" value="type" disabled/>';
  cell3.innerHTML =
    '<select id="clothe_name' +
    n +
    '" class="form-control js-example-basic-single" style="width: 100%;" onchange=""><option value="3">Saro 3P LONG</option><option value="4">Saro</option></select>';
  cell4.innerHTML =
    '<input id="clothe_description' +
    n +
    '" type="text" class="form-control" placeholder="description" value="RAS"/>';
  cell5.innerHTML =
    '<input id="clothe_priceUnitary' +
    n +
    '" type="number" class="form-control" value="10" disabled/>';

  cell6.innerHTML =
    '<div onclick="RemoveRow(this)" class="text-center rounded bg-danger"><div class="center-svg"><i class="fa fa-minus"> </i></div></div>';

  document.getElementById("clothes_number").value = n;
  update_total();
}

// Function to remove a row from a table
function RemoveRow(x) {
  let rowIndex = x.parentElement.parentElement.rowIndex;
  // Get the table with its id
  var table = document.getElementById("clothes_details");
  //   Delete the row
  table.deleteRow(rowIndex);
  //   Update cells id
  for (let index = rowIndex + 1; index <= n; index++) {
    document.getElementById("clothe_code" + index).id =
      "clothe_code" + (index - 1);
    document.getElementById("clothe_type" + index).id =
      "clothe_type" + (index - 1);
    document.getElementById("clothe_name" + index).id =
      "clothe_name" + (index - 1);
    document.getElementById("clothe_description" + index).id =
      "clothe_description" + (index - 1);
    document.getElementById("clothe_priceUnitary" + index).id =
      "clothe_priceUnitary" + (index - 1);
  }
  //   Update the number of rows
  n--;
  //   Update the clothe number
  document.getElementById("clothes_number").value = n;
  //   Update the total amount to pay
  update_total();
  // }
}

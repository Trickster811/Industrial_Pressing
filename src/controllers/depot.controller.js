let n = 1;

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
    '" type="number" class="form-control" value="0" disabled/>';

  cell6.innerHTML =
    '<div onclick="RemoveRow(this)" class="text-center rounded bg-danger"><div class="center-svg"><i class="fa fa-minus"> </i></div></div>';

  document.getElementById("clothes_number").value = n;
}

// Function to remove a row from a table
function RemoveRow(x) {
  // if (confirm("Confirmer la suppression ?")) {
  var table = document.getElementById("clothes_details");
  //alert(x.parentElement.rowIndex);
  table.deleteRow(x.parentElement.parentElement.rowIndex);
  n--;
  document.getElementById("clothes_number").value = n;
  // }
}

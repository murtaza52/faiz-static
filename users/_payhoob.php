<?php
include('connection.php');
include('adminsession.php');

if($_POST)
{
  $sql = "UPDATE thalilist set Paid = Paid + " . $_POST["receipt_amount"] . "   WHERE thali = ". $_POST['receipt_thali'];
  $update = mysqli_query($link, $sql);
  $sql = "INSERT INTO receipts (`Receipt No`, `Thali No`, `Amount`, `Date`) VALUES (" . $_POST["receipt_number"] . "," . $_POST['receipt_thali'] . "," . $_POST["receipt_amount"] . ", '" . $_POST['receipt_date'] . "')";
  $insert = mysqli_query($link, $sql);
  echo "success";
}
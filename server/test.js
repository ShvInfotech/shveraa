const url = 'https://track.delhivery.com/api/cmu/create.json';
const options = {
  method: 'POST',
  headers: {
    Authorization: 'Token c4a879ebfaca226e04835194373408ffcb5d3e49',
    Accept: 'application/json',
    'Content-Type': 'application/json'
  },
  body: 'format=json&data={\n  "shipments": [\n    {\n      "name": "Consignee name",\n      "add": "Huda Market, Haryana",\n      "pin": "110042",\n      "city": "Gurugram",\n      "state": "Haryana",\n      "country": "India",\n      "phone": "9999999999",\n      "order": "Test Order 01",\n      "payment_mode": "Prepaid",\n      "return_pin": "",\n      "return_city": "",\n      "return_phone": "",\n      "return_add": "",\n      "return_state": "",\n      "return_country": "",\n      "products_desc": "",\n      "hsn_code": "",\n      "cod_amount": "",\n      "order_date": null,\n      "total_amount": "",\n      "seller_add": "",\n      "seller_name": "",\n      "seller_inv": "",\n      "quantity": "",\n      "waybill": "",\n      "shipment_width": "100",\n      "shipment_height": "100",\n      "weight": "",\n      "shipping_mode": "Surface",\n      "address_type": ""\n    }\n  ],\n  "pickup_location": {\n    "name": "FINIZIA B2C"\n  }\n}'};

fetch(url, options)
	.then(res => res.json())
	.then(json => console.log(json.packages))
	.catch(err => console.error(err));
const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  external_id: String,
  state: String,
  status: String,
  customers: {
    id: String,
    name: {
      display_name: String,
      first_name: String,
      last_name: String,
    },
    contact: {
      number: String,
      country_iso2: String,
    },
    location: { // New field
      latitude: Number,
      longitude: Number,
      address: {
        street_address_line_one: String,
        street_address_line_two: String,
        city: String,
        country: String,
        postal_code: String,
      },
    },
  },
  carts: [
    {
      items: [
        {
          id: String,
          title: String,
          quantity: {
            amount: Number,
            unit: String,
          },
        },
      ],
    },
  ],
  payment: {
    order_total: {
      net: {
        amount_e5: Number,
        currency_code: String,
      },
    },
  },
  created_time: String,
  retailer_loyalty_info: {
    loyalty_number: Number,
  },
});

module.exports = mongoose.model('Order', OrderSchema);

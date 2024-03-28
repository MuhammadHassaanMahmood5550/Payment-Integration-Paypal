const express = require('express');
const paypal = require('paypal-rest-sdk');
const app = express();
//for test payment
// user/customer demo account = sb-f943jk28159168@personal.example.com
// user/customer demo account passwod = My*pass0***
//  note in stripe for test payment we dont need demo account created on stripe instead you can use any 
//email with demo/test card information as card no = 4242 4242 4242 4242, MM /YY = 11 / 24, CVC = 123.


paypal.configure({
    'mode': 'sandbox', //sandbox or live //sandbox means demo/try
    'client_id': 'AYyJQn7Mn56LGjj2IysLYnXJuDN5iVCoT7gnNz9NgyCPkaOKVXYCP0uPYqY1-LoozPcJ5_d-s02wdyhg',
    'client_secret': 'EB41Atj-4-GEfTVFie1MKjqXx0GSnQUdXGyiRzBINh03Dn3k-Z6pbt-dlV9kk9fkLhFwXW_dpfefXWHz'
});

app.get('/', (req, res) => {
    //my directory name = D:\node js\payment integration\payment integration paypal
    res.sendFile(__dirname + "/index.html");
})

// when user click on buy buttom this below methos will take user to the payment detail page to fill card detail if information in create_payment_json is correct and complete.
app.post('/pay', (req, res) => {
    const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:4000/success",
            "cancel_url": "http://localhost:4000/cancel"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "Redhock Bar Shoes",
                    "sku": "001",
                    "price": "25.00",
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "USD",
                "total": "25.00"
            },
            "description": "Comfertable Running Shoes"
        }]
    };

    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            console.log("paypal.payment.create payment =", payment);
            for (let i = 0; i < payment.links.length; i++) {
                if (payment.links[i].rel === 'approval_url') {
                    res.redirect(payment.links[i].href); // here it actually take you to the payment detal page. we can do this same in stripe but for more security we did same thing in stripe from client side as we send payment detal page url to frontend and from frontend we take user to payment detal page. 
                }
            }
        }
    });

});

// after payment detail page, when you enter correct card detail /success method occur this is where actual payment execution occur if no in this final executon show msg as success. 
app.get('/success', (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;

    console.log("/success", req.query);

    const execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{
            "amount": {
                "currency": "USD",
                "total": "25.00"
            }
        }]
    };

    // this is the main funcion to transactions
    //Obtains the transaction details from paypal
    //also you can save transaction detail in database for reference in future.
    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        //When error occurs when due to non-existent transaction, throw an error else log the transaction details in the console then send a Success string reposponse to the user.
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            console.log("/success JSON.stringify(payment)", JSON.stringify(payment));
            res.send('Success');
        }
    });
});


app.get('/cancel', (req, res) => res.send('Cancelled'));


app.listen(4000, () => {
    console.log('Server is listening on port 4000');
})
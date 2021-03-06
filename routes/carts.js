//requires
var express = require('express');
var bodyParser = require('body-parser'); //parser for json
var Cart = require('./../lib/cart.js'); //Model
var Item = require('./../lib/items.js');
var User = require('./../lib/users.js');
var jsonParser = bodyParser.json();
var router = express.Router();
var util = require('util');

router.get('/contents', function(req, res) {

  Cart.find({}, function(error, cartList) {
    // console.log("This is here" + cartList);
    res.json(cartList);

  });
});

// router.get('/contents', function(req, res) {
//   Cart.find({}, function(err, items) {
//     res.json(items);
//   })
// });


var ensureCartInSession = function(req, res, next) {
  if (req.session.cart) {
    console.log("ensureCartInSession: found cart:" + util.inspect(req.session.cart));

    return next();
  } else {
    Cart.findOne({
      user: req.user._id
    }, function(err, cart) {
      console.log("ensureCartInSession: cart callback: cart found is " + util.inspect(cart));

      if (err) {
        console.log(
          "ensureCartInSession: error finding the cart, probably doesn't exist at this point");
      } else {
        if (cart) {
          req.session.cart = cart; // stick around for the session
          return next();
        } else {
          console.log('ensureCartInSession: Create me a cart for user with id = ' + req.user._id);
          Cart.create({
            user: req.user._id
          }, function(err, cart) {
            req.session.cart = cart;
            return next();
          }); // end of Cart.create
        } // end of else
      }; // end of findOne callback function

    });
  }
};


router.post('/contents', ensureCartInSession);
router.post('/contents', function(req, res) {

  console.log('Adding product to cart, cart is : ' + util.inspect(req.session.cart));
  console.log('Adding product to cart, products are : ' + util.inspect(req.session.cart.products));
  console.log("Adding product to cart: " + util.inspect(req.body.products));

  req.session.cart.products.push(req.body.products);
  console.log('Adding product to cart, AFTER products are : ' + util.inspect(req.session.cart.products));
  var cartCount = req.session.cart.products.length;
  // console.log("hello, I count the items in the cart: " + cartCount);
  //  res.send(req.session.cart);
  //  res.status(200);
  req.session.save(function(err, cart) {

    if (err) {
      return res.sendStatus(400);
    } else {
      res.send(cart);
      res.status(200);
    };
  });

});

router.patch('/contents', function(req, res) {
  var index = req.session.cart.products.indexOf(req.body.product);
  req.session.cart.products.splice(index, 1);
  req.session.save(function(err, status){
    if (err) {
      return res.sendStatus(400);
    }
    console.log(status);
    res.sendStatus(204);
  });
});

module.exports = router;

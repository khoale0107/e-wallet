var express = require('express');

var router = express.Router();
var MongoClinet = require('mongodb').MongoClient;

// connect database
const db = require('../config/connect');
db.connect;

// model
const accountModel = require('../models/account');
const historyModel = require('../models/history');


/* GET home page. */
router.get('/', function(req, res, next) {  

  res.render('index', { title: 'Express'});

});
router.get('/index', function(req, res, next) {  
  res.render('index', { title: 'Express' });
});


router.get('/transferMoney', function(req, res, next) {
  res.render('transferMoney', { title: 'transferMoney', layout: false,user: req.session.user});
});

router.get('/buyCardMobile', function(req, res, next) {
  res.render('buyCardMobile', { title: 'buyCardMobile', layout: false});
});


router.get('/manageApprovals', async function(req, res, next) {
  let historys = await historyModel.find()
  historys= historys.map(historyModel=>historyModel.toObject())
  res.render('manageApprovals', { title: 'manageApprovals',historys:historys});
});


router.get('/manageApprovals/:maGiaoDich', async function(req, res, next) {  
  let ma = req.params.maGiaoDich;
  let history = (await historyModel.findOne({maGiaoDich:ma})).toObject();
  history.ngay = new Date(history.ngay).toLocaleDateString()
  res.render('detailsTransactionHistory', { title: 'detailsTransactionHistory',history:history,layout:false});
});


router.get('/manageAccountList', async function(req, res, next) {
  let accounts = await accountModel.find()
  accounts = accounts.map(accountModel=>accountModel.toObject())   
  res.render('manageAccountList', {title: 'manageAccountList', accounts: accounts})

});


router.get('/manageAccountList/:userName', async function(req, res, next) {
  userName= req.params.userName;

  let account = (await accountModel.findOne({userName:userName})).toObject();

  
  res.render('personalPage', { title: 'personalPage',account:account});


});


router.get('/personalPage',  function(req, res, next) {

  res.render('personalPage', { title: 'personalPage',account:req.session.user});
});




router.get('/recharge', function(req, res, next) {
  res.render('recharge', { title: 'recharge', layout: false});
});



router.get('/transactionHistory', function(req, res, next) {
  res.render('transactionHistory', { title: 'transactionHistory'});
});


router.get('/withdrawMoney', function(req, res, next) {
  res.render('withdrawMoney', { title: 'withdrawMoney', layout: false});
});



module.exports = router;

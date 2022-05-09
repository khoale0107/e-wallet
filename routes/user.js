var router = require('express').Router();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const upload = multer({ dest: 'uploads' })

// connect database
const db = require('../config/connect');
db.connect;

// model
const Account = require('../models/account');
const async = require('hbs/lib/async');

//validators=========================================================================
const loginValidators = [
  check('username')
    .exists().withMessage('Missing email field')
    .notEmpty().withMessage('Tên đăng nhập không hợp lệ')
    .isLength({min: 10, max: 10}).withMessage('Tên đăng nhập gồm 10 chữ số'),

  check('password')
    .exists().withMessage('Missing password field')
    .notEmpty().withMessage('Mật khẩu không hợp lệ')
    .isLength({min: 6, max: 6}).withMessage('Mật khẩu gồm 6 ký tự'),
]

const registerValidators = [
  check('sdt')
    .exists().withMessage('Missing sdt field')
    .notEmpty().withMessage('Hãy nhập số điện thoại')
    .custom(val => {
      if (val.match(/[a-zA-Z]/)) 
        throw new Error('Số điện thoại không hợp lệ')
      else if (!val.match(/^[0-9]{10,11}$/)) 
        throw new Error('Số điện thoại bao gồm 10 hoặc 11 chữ số')
      else return true
    }),

  check('email')
    .exists().withMessage('Missing email field')
    .notEmpty().withMessage('Vui lòng nhập email')
    .isEmail().withMessage('Email không hợp lệ'),

  check('tenNguoiDung')
    .exists().withMessage('Missing tenNguoiDung field')
    .notEmpty().withMessage('Vui lòng nhập họ và tên'),

  check('diaChi')
    .exists().withMessage('Missing diaChi field')
    .notEmpty().withMessage('Vui lòng nhập địa chỉ'),

  check('ngaySinh')
    .exists().withMessage('Missing ngaySinh field')
    .notEmpty().withMessage('Vui lòng chọn ngày sinh') 
]

router.get('/login', function(req, res, next) {
  if (req.session.user) {
    res.redirect('/')
  }

  res.locals.msg = req.flash('msg')
  res.locals.username = req.flash('username')
  res.locals.password = req.flash('password')
  res.render('login', { title: 'login', layout: false });
});

//login post =====================================================================================
router.post('/login', loginValidators, async function(req, res, next) {
  let { username, password } = req.body
  let results = validationResult(req)

  //validate input
  if (results.errors.length > 0) {
    req.flash('msg', results.errors[0].msg)
    req.flash('username', username)
    return res.redirect('login');
  }

  let user = await Account.findOne({username})
  //check user
  if (!user) {
    req.flash('msg', 'Tên đăng nhập hoặc mật khẩu không đúng')
    req.flash('username', username)
    return res.redirect('/login')
  }
  
  //check password
  let hashed = user.password
  if (!bcrypt.compareSync(password, hashed)) {
    req.flash('msg', 'Tên đăng nhập hoặc mật khẩu không đúng')
    req.flash('username', username)
    return res.redirect('/login')
  }

  //login success
  req.session.user = user

  return res.redirect('/')
});


router.get('/register', function(req, res, next) {
  if (req.session.user) {
    res.redirect('/')
  }

  res.locals.msg = req.flash('msg')
  res.locals.successMsg = req.flash('successMsg')
  res.locals.sdt = req.flash('sdt')
  res.locals.email = req.flash('email')
  res.locals.tenNguoiDung = req.flash('tenNguoiDung')
  res.locals.diaChi = req.flash('diaChi')
  res.locals.ngaySinh = req.flash('ngaySinh')

  res.render('register', { title: 'register', layout: false });
});

//register post =====================================================================================
const getImages = upload.fields([{ name: 'matTruocCMND'}, { name: 'matSauCMND'}])

router.post('/register', getImages, registerValidators, function(req, res, next) {
  let { sdt, email, tenNguoiDung, diaChi, ngaySinh } = req.body
  let results = validationResult(req)

  //flash
  req.flash('sdt', sdt)
  req.flash('email', email)
  req.flash('tenNguoiDung', tenNguoiDung)
  req.flash('diaChi', diaChi)
  req.flash('ngaySinh', ngaySinh)

  // //validate fields
  if (results.errors.length > 0) {
    req.flash('msg', results.errors[0].msg)
    return res.redirect('register');
  }
  if (!req.files.matTruocCMND || !req.files.matSauCMND) {
    req.flash('msg', 'Vui lòng chọn ảnh mặt trước và mặt sau CMND')
    return res.redirect('register');
  }

  console.log(req.files)

  //create random username and password
  let username = Math.random().toString().slice(2, 12)
  let password = Math.random().toString(36).slice(2, 8)
  let matTruocCMND = `${sdt}_MT.png`
  let matSauCMND = `${sdt}_MS.png`
  
  //insert new account
<<<<<<< HEAD
  let quyen=1; //0 admin,  1 được phép, 2 chờ duyệt, 3 bi vô hiêu hóa 
  let soDu= 0;
  let ngayMoThe = '2/2022'; // ngày đầu tạo thẻ
  let soLoi = 0; // số lỗi người dùng khi đăng nhập
  let anhDaiDien = "";
  let matTruocCMND = "";
  let matSauCMND = "";
  let loi = 0;
new Account({ sdt,quyen,email, tenNguoiDung, diaChi, ngaySinh, username, password,soDu,ngayMoThe,soLoi,anhDaiDien,matTruocCMND,matSauCMND,loi}).save()
=======
  new Account({ 
    sdt, email, tenNguoiDung, diaChi, ngaySinh, username, matTruocCMND, matSauCMND,
    password: bcrypt.hashSync(password, 10),
  }).save()
>>>>>>> 7b91bb57b892cede728cdd31b84aa81847e614fa
  .then(newAccount => {
    //create and save user resources
    let userFolder = `./userResources/${sdt}`
    fs.mkdirSync(userFolder, { recursive: true })
    fs.renameSync(req.files.matTruocCMND[0].path, `${userFolder}/${sdt}_MT.png`)
    fs.renameSync(req.files.matSauCMND[0].path, `${userFolder}/${sdt}_MS.png`)

    //save username and password to account_list.txt
    let newAccountInfo = `\nten: ${tenNguoiDung}\n username: ${username}\n password: ${password}\n`
    fs.appendFileSync("./account_list.txt", newAccountInfo);

    req.flash('successMsg', 'Tạo tài khoản thành công. <a href="/login">Đăng nhập</a>')
    return res.redirect('register');
  })
  .catch(err => {
    if (err.code == 11000) {
      req.flash('msg', 'Số điện thoại hoặc email đã được sử dụng')
      return res.redirect('register');
    }
    else {
      console.log(err.message);
      req.flash('msg', 'Có lỗi xảy ra, vui lòng thử lại sau')
      return res.redirect('register');
    }
  })
});


module.exports = router;
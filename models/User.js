const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    maxlength: 50,
  },
  email: {
    type: String,
    trim: true,
    unique: 1,
  },
  password: {
    type: String,
    minlength: 5,
  },
  lastname: {
    type: String,
    maxlength: 50,
  },
  role: {
    type: Number,
    default: 0,
  },
  image: String,
  token: {
    type: String,
  },
  tokenExp: {
    type: Number,
  },
});

//몽구스에서 제공해주는 메소드
//유저 정보를 저장하기 전에 실행하는 동작
userSchema.pre("save", function (next) {
  var user = this;

  console.log(user);

  //비밀번호를 수정할때만 암호화
  if (user.isModified("password")) {
    //비밀번호 암호화
    //salt생성
    bcrypt.genSalt(saltRounds, function (err, salt) {
      if (err) return next(err);

      //hash생성(암호화된 비밀번호)
      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) return next(err);
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

// userSchema.methods.comparePassword = function (plainPassword, cb) {
//   //plainPassword 1234567  암호화된 비밀번호 asdvg3873~~
//   bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
//     console.log(this.password);
//     if (err) return cb(err), cb(null, isMatch);
//   });
// };

userSchema.methods.generateToken = function () {
  console.log("작동");
  var user = this;
  //jsonwebtoken을 이용해서 token을 생성
  var token = jwt.sign(user._id.toHexString(), "secretToken");

  user.token = token;
  // user.save(function (err, user) {
  //   if (err) return cb(err);

  //   cb(null, user);
  // });
  user.save();
  return user;
};

userSchema.statics.findByToken = function (token, cb) {
  var user = this;

  //토큰 decode
  jwt.verify(token, "secretToken", function (err, decoded) {
    //유저 아이디를 이용해서 유저를 찾은 다음
    //클라이언트에서 가져온 토큰과 db에 보관된 토큰이 일치하는지 확인
    // user.findOne({ _id: decoded, token: token }, function (err, user) {
    //   if (err) return cd(err);
    //   cd(null, user);
    // });
    const result = user.findOne({ _id: decoded, token: token });
    if (result === null) return err;
    else return result;
  });
};

const User = mongoose.model("User", userSchema);
module.exports = { User };

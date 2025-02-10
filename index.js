const express = require("express");
const app = express();
const port = 5000;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");

const { User } = require("./models/User");

const config = require("./config/key");

const { auth } = require("./middleware/auth");

//application/x-www-form-urlencoded 데이터를 분석하여 가져옴
app.use(bodyParser.urlencoded({ extended: true }));

//application/json 데이터 분석하여 가져옴
app.use(bodyParser.json());

app.use(cookieParser());

const mongoose = require("mongoose");

mongoose
  .connect(config.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected.."))
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Hello World! hihi");
});

app.post("/api/users/register", (req, res) => {
  //회원 가입 할때 필요한 정보들을 client에서 가져오면
  //그것들을 데이터 베이스에 넣어준다
  const user = new User(req.body);

  // user.save((err, userInfo) => {
  //   if (err) return res.json({ success: false, err });
  //   return res.status(200).json({
  //     success: true,
  //   });
  // });

  user
    .save()
    .then(() => {
      res.status(200).json({
        success: true,
      });
    })
    .catch((err) => {
      res.json({ success: false, err });
    });
});

app.post("/api/users/login", async (req, res) => {
  //요청된 이메일을 데이터베이스에서 있는지 찾음
  // User.findOne({ email: req.body.email }, (err, user) => {
  //   if (!user) {
  //     return res.json({
  //       loginSuccess: false,
  //       message: "제공된 이메일에 해당하는 유저가 없습니다.",
  //     });
  //   }
  // });

  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return res.json({
      loginSuccess: false,
      message: "제공된 이메일에 해당하는 유저가 없습니다.",
    });
  }

  //요청된 이메일이 데이터베이스에 있다면 비밀번호가 맞는 비밀번호인지 확인
  // user.comparePassword(req.body.password, (err, isMatch) => {
  //   if (!isMatch) {
  //     return res.json({
  //       loginSuccess: false,
  //       message: "비밀번호가 틀렸습니다.",
  //     });
  //   }
  // });

  const isMatch = bcrypt.compare(req.body.password, user.password);
  if (!isMatch) {
    return res.json({ loginSuccess: false, message: "비밀번호가 틀렸습니다" });
  }

  //비밀번호까지 맞다면 토큰을 생성
  // user.generateToken((err, user) => {
  //   if (err) return res.status(400).send(err);

  //   //토큰을 쿠키로 저장
  //   res
  //     .cookie("x_auth", user.token)
  //     .status(200)
  //     .json({ loginSuccess: true, userId: user._id });
  // });

  const userToken = await user.generateToken();
  res
    .cookie("x_auth", userToken.token)
    .status(200)
    .json({ loginSuccess: true, userId: userToken._id });
});

app.get("/api/users/auth", auth, (req, res) => {
  //여기까지 미들웨어를 통과해 왔다는 얘기는 Authentication이 ture라는 뜻
  res.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image,
  });
});

//로그아웃
app.get("/api/users/logout", auth, (req, res) => {
  User.findOneAndUpdate({ _id: req.user._id }, { token: "" }, (err, user) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).send({
      success: true,
    });
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

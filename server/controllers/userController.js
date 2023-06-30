const User = require("../models/User");
const fileHandler = require("../utils/fileHandler");
const { body, validationResult } = require("express-validator");

// 입력 데이터의 유효성 검사 미들웨어

// 1. 유저이름 유효성 검사
const isValidUsername = () =>
  body("username")
    .trim()
    .isLength({ min: 5 })
    .withMessage("Username must be at least 5 characters.")
    .isAlphanumeric()
    .withMessage("Username is only allowed in alphabet and number.");

// 2. 이메일 유효성 검사
const isValidEmail = () =>
  body("email").trim().isEmail().withMessage("E-mail is not valid");

// 3. 비밀번호 유효성 검사
const isValidPassword = () =>
  body("password")
    .trim()
    .isLength({ min: 5 })
    .withMessage("Password must be at least 5 characters");

// 4. 이메일 중복확인
const emailInUse = async (email) => {
  // 입력된 이메일로 유저를 검색한다.
  const user = await User.findOne({ email });

  // 유저가 존재하는 경우
  if (user) {
    return Promise.reject("E-mail is already in use");
  }
};

// 5. 유저이름 중복확인
const usernameInUse = async (username) => {
  // 입력된 유저이름으로 유저를 검색한다.
  const user = await User.findOne({ username });

  // 유저가 존재하는 경우
  if (user) {
    return Promise.reject("Username is already in use");
  }
};

// 6. 이메일 존재확인
const doesEmailExists = async (email) => {
  // 입력된 이메일로 유저를 검색한다.
  const user = await User.findOne({ email });
  
  // 유저가 존재하지 않을 경우
  if (!user) {
    return Promise.reject("User is not found");
  }
};

// 7. 비밀번호 검사
const doesPasswordMatch = async(password, {req})=>{
  // 입력된 이메일로 유저를 검색한다.
  const email = req.body.email;
  const user = await User.findOne({email});

  // 검색된 유저의 비밀번호와 입력된 비밀번호를 비교한다.
  if(!user.checkPassword(password)){
    return Promise.reject("Password does not match");
  }
}

// 유저 생성
exports.create = [
  isValidUsername().custom(usernameInUse),
  isValidEmail().custom(emailInUse),
  isValidPassword(),
  async(req,res,next) =>{
    try{
      // 유효성 검사 결과
      const errors = validationResult(req);

      // 검사 실패
      if(!errors.isEmpty()){
        const err = new Error();
        err.errors = errors.array();
        err.status = 400; // 400 BadRequest 
        throw err;
      }

      // 클라이언트가 전송한 데이터
      const {email, fullName, username, password} = req.body;
      
      // 유저 생성
      const user = new User();

      user.email = email;
      user.fullName = fullName;
      user.username = username;
      user.setPassword(password); // 비밀번호 암호화

      await user.save();

      // 클라이언트에게 생성한 유저데이터를 전송한다.
      res.json({user});

    }catch(error){
      // 에러핸들러에게 에러를 전달한다. 에러핸들러는 app.js 에 있다.
      next(error)
    }
  }
];

// 유저 정보 수정
exports.update = [
  // 프로필 사진(파일) 처리
  fileHandler("profiles").single("avatar"),
  // 유효성 검사
  // 입력데이터가 있을 경우 유효성 검사
  isValidUsername().custom(usernameInUse).optional(),
  isValidEmail().custom(emailInUse).optional(),
  async(req, res, next) =>{
    try{
      // 유효성 검사 결과
      const errors = validationResult(req);

      // 검사 실패
      if(!errors.isEmpty()){
        const err = new Error();
        err.errors = errors.array();
        err.status = 400; // 400 BaudRequest
        throw err;
      }

      // req.user : 로그인 유저
      const _user = req.user;

      // 프로필 사진을 업로드한 경우
      if(req.file){ // req.file : 클라이언트가 전송한 파일
        _user.avatar = req.file.filename;
      }

      // 로그인 유저의 정보 중 클라이언트가 수정 요청을 한 정보만 업데이트한다. 
      Object.assign(_user, req.body); // (앞 인자에 뒤 인자의 내용을 덮어쓰기 한다.)

      await _user.save(); // 변경사항을 저장한다.

      // 토큰을 재발급한다.
      const token = _user.generateJWT();

      const user = {
        username: _user.username,
        email : _user.email,
        fullName : _user.fullName,
        avatar :_user.avatar,
        bio : _user.bio,
        token
      }

      // 업데이트한 유저와 토큰을 전송한다.
      res.json({user})

    }catch(error){
      next(error)
    }
  }
];

// 로그인
exports.login = [
  isValidEmail().custom(doesEmailExists),
  isValidPassword().custom(doesPasswordMatch),
  async(req, res, next) =>{
    try{  
      // 유효성 검사 결과
      const errors = validationResult(req);

      // 검사 실패
      if(!errors.isEmpty()){
        const err = new Error();
        err.errors = errors.array();
        err.status = 401; // 401 Unauthorized(인증 실패)
        throw err;
      }

      const {email} = req.body;

      // 클라이언트가 전송한 이메일로 유저를 검색한다.
      const _user = await User.findOne({email});

      // 로그인 토큰 생성
      const token = _user.generateJWT();

      const user = {
        username: _user.username,
        email : _user.email,
        fullName : _user.fullName,
        avatar : _user.avatar,
        bio : _user.bio,
        token
      }

      // 클라이언트에게 유저데이터와 토큰을 전송한다.
      res.json({user})

    }catch(error){
      next(error)
    }
  }
];

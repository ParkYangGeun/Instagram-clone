const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// 유저 스키마(구조)
const userSchema = new Schema(
  {
    // 아이디
    username: { type: String, required: true, minLength: 3, maxLength: 100 },
    // 비밀번호
    password: { type: String, minLength: 5 },
    // 비밀번호 암호화에 사용되는 키
    salt: { type: String },
    // 이메일
    email: { type: String, require: true, maxLength: 100 },
    // 사용자 이름
    fullName: { type: String },
    // 프로필 사진
    avatar: { type: String, default: "default.png" },
    // 자기소개
    bio: { type: String },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// 유저의 오퍼레이션(Operation)

// 1. 로그인 토큰 생성
userSchema.methods.generateJWT = function () {
  // 로그인 토큰 생성에 username 을 사용한다.
  // SECRET 을 사용하여 토큰을 생성한다.
  return jwt.sign({ username: this.username }, process.env.SECRET);
};

// 2. 비밀번호 암호화
userSchema.methods.setPassword = function (password) {
  // 암호화에 사용하는 키
  this.salt = crypto.randomBytes(16).toString("hex");

  // 해시함수를 사용한 단방향 암호화
  this.password = crypto
    .pbkdf2Sync(password, this.salt, 310000, 32, "sha256")
    .toString("hex");
};

// 3. 비밀번호 일치 여부 검사
userSchema.methods.checkPassword = function (password) {
  // 유저 생성에 사용되었던 salt를 가지고
  // 로그인 시 입력받은 비밀번호를 암호화한다.

  const hashedPassword = crypto
    .pbkdf2Sync(password, this.salt, 310000, 32, "sha256")
    .toString("hex");

  return this.password === hashedPassword;
};

// 컬렉션 조인 (데이터 가공)
userSchema.virtual("isFollowing", {
  ref: "Follow", // Follow 컬렉션과 조인
  localField: "_id",
  foreignField: "following",
  justOne: true,
});

module.exports = mongoose.model("User", userSchema);

const mongoose = require("mongoose")
const Schema = mongoose.Schema;
const {DateTime} = require("luxon"); // 데이터 가공 패키지

// 스키마 (구조)
const articleSchema = new Schema({
  // 사진
  photos: [{type:String, required: true}],
  // 사진에 대한 설명
  description : {type: String},
  // 게시물 작성자 (User 컬렉션 참조)
  author : {type: Schema.ObjectId, required : true, ref: "User"},
  // 좋아요 갯수
  favoriteCount: {type: Number, default:0},
  // 게시물 생성일
  // 기본값 : 게시물 생성시간
  created : {type: Date, default:Date.now},
},{
  toJSON:{virtuals:true},
  toObject:{virtuals:true}
})

// 버추얼 필드 (보여주기용 날짜 생성)
// 필드의 이름 : displayDate
articleSchema.virtual("displayDate").get(function(){
  return DateTime
    .fromJSDate(this.created)
    .toLocaleString(DateTime.DATE_MED);
})

// 컬렉션 조인

// 1. 댓글 갯수 파악
articleSchema.virtual("commentCount", {
  ref : "Comment", // Comment 컬렉션과 조인
  localField : "_id",
  foreignField : "article",
  count : true
})

// 2. 좋아요 여부 확인
articleSchema.virtual("isFavorite", {
  ref: "Favorite",
  localField :"_id",
  foreignField : "article",
  justOne : true
})

module.exports = mongoose.model("Article", articleSchema)

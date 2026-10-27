import mongoose from 'mongoose';
const outfitSchema=new mongoose.Schema({
  owner:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true,index:true},
  name:{type:String,required:true,trim:true,maxlength:100},
  clothingItemIds:[{type:mongoose.Schema.Types.ObjectId,ref:'ClothingItem'}],
  occasion:{type:String,default:'Casual'},
  plannedDate:{type:Date,default:null},
  wornAt:[{type:Date}],
  status:{type:String,enum:['planned','worn'],default:'planned'}
},{timestamps:true});
export default mongoose.model('Outfit',outfitSchema);

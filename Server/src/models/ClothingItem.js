import mongoose from 'mongoose';
const clothingSchema=new mongoose.Schema({
  owner:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true,index:true},
  name:{type:String,required:true,trim:true,maxlength:100},
  category:{type:String,required:true,enum:['Tops','Bottoms','Shoes','Outerwear','Accessories','Dresses']},
  color:{type:String,required:true,trim:true,maxlength:40},
  season:{type:String,default:'All season'},
  occasions:{type:[String],default:['Casual']},
  style:{type:String,default:'Minimal'},
  imageUrl:{type:String,default:''},
  favorite:{type:Boolean,default:false},
  wearCount:{type:Number,default:0,min:0}
},{timestamps:true});
export default mongoose.model('ClothingItem',clothingSchema);

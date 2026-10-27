import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import ClothingItem from '../models/ClothingItem.js';
import Outfit from '../models/Outfit.js';

const run=async()=>{
  if(!process.env.MONGODB_URI||!process.env.JWT_SECRET)throw new Error('Configure MONGODB_URI and JWT_SECRET in server/.env first.');
  await mongoose.connect(process.env.MONGODB_URI);
  const email='demo@wardrobewise.local';
  let user=await User.findOne({email});
  if(!user)user=await User.create({name:'WardrobeWise Demo',email,passwordHash:await bcrypt.hash('WardrobeDemo123!',12)});
  const existing=await ClothingItem.countDocuments({owner:user._id});
  if(!existing){
    const seed=[
      {name:'Linen button-down',category:'Tops',color:'Ivory',season:'Summer',occasions:['Casual','College'],wearCount:8,favorite:true},
      {name:'Tailored wide-leg pants',category:'Bottoms',color:'Black',season:'All season',occasions:['Work','College'],wearCount:12},
      {name:'Everyday white sneakers',category:'Shoes',color:'White',season:'All season',occasions:['Casual','College'],wearCount:21,favorite:true},
      {name:'Soft knit cardigan',category:'Outerwear',color:'Oatmeal',season:'Winter',occasions:['Casual'],wearCount:5},
      {name:'Classic black tee',category:'Tops',color:'Black',season:'All season',occasions:['Casual','College'],wearCount:16},
      {name:'Satin midi skirt',category:'Bottoms',color:'Sage',season:'Spring',occasions:['Date night','Party'],wearCount:3,favorite:true},
      {name:'Structured tote',category:'Accessories',color:'Tan',season:'All season',occasions:['Work','College'],wearCount:11},
      {name:'Gold hoop earrings',category:'Accessories',color:'Gold',season:'All season',occasions:['Any'],wearCount:18}
    ];
    await ClothingItem.insertMany(seed.map(x=>({...x,owner:user._id})));
  }
  console.log('Seed complete. Demo account:',email,'Password: WardrobeDemo123!');
  console.log('Seed only inserts sample items when this account has none; it does not delete existing data.');
  await mongoose.disconnect();
};
run().catch(e=>{console.error(e.message);process.exit(1);});

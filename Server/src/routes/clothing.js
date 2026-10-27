import { Router } from 'express';
import mongoose from 'mongoose';
import ClothingItem from '../models/ClothingItem.js';
import { authRequired } from '../middleware/auth.js';
const router=Router();
router.use(authRequired);
router.get('/',async(req,res,next)=>{
  try{
    const filter={owner:req.user.id};
    if(req.query.category&&req.query.category!=='All items')filter.category=req.query.category;
    if(req.query.favorite==='true')filter.favorite=true;
    if(req.query.q)filter.$or=[{name:{$regex:String(req.query.q).slice(0,60),$options:'i'}},{color:{$regex:String(req.query.q).slice(0,60),$options:'i'}}];
    const sort=req.query.sort==='mostWorn'?{wearCount:-1}:req.query.sort==='leastWorn'?{wearCount:1}:req.query.sort==='name'?{name:1}:{createdAt:-1};
    res.json(await ClothingItem.find(filter).sort(sort).limit(200));
  }catch(e){next(e);}
});
router.post('/',async(req,res,next)=>{
  try{
    const {name,category,color}=req.body;
    if(!String(name||'').trim()||!category||!String(color||'').trim())return res.status(400).json({message:'Name, category and color are required.'});
    res.status(201).json(await ClothingItem.create({...req.body,owner:req.user.id}));
  }catch(e){next(e);}
});
router.param('id',(req,res,next,id)=>{if(!mongoose.isValidObjectId(id))return res.status(400).json({message:'Invalid item ID.'});next();});
router.get('/:id',async(req,res,next)=>{try{const item=await ClothingItem.findOne({_id:req.params.id,owner:req.user.id});if(!item)return res.status(404).json({message:'Item not found.'});res.json(item);}catch(e){next(e);}});
router.patch('/:id',async(req,res,next)=>{
  try{
    const allowed=['name','category','color','season','occasions','style','imageUrl','favorite','wearCount'];
    const updates=Object.fromEntries(Object.entries(req.body).filter(([k])=>allowed.includes(k)));
    const item=await ClothingItem.findOneAndUpdate({_id:req.params.id,owner:req.user.id},updates,{new:true,runValidators:true});
    if(!item)return res.status(404).json({message:'Item not found.'});res.json(item);
  }catch(e){next(e);}
});
router.delete('/:id',async(req,res,next)=>{try{const item=await ClothingItem.findOneAndDelete({_id:req.params.id,owner:req.user.id});if(!item)return res.status(404).json({message:'Item not found.'});res.json({message:'Item deleted.'});}catch(e){next(e);}});
export default router;

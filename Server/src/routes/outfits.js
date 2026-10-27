import { Router } from 'express';
import mongoose from 'mongoose';
import Outfit from '../models/Outfit.js';
import ClothingItem from '../models/ClothingItem.js';
import { authRequired } from '../middleware/auth.js';
const router=Router();
router.use(authRequired);
router.get('/',async(req,res,next)=>{try{res.json(await Outfit.find({owner:req.user.id}).populate('clothingItemIds').sort({createdAt:-1}).limit(200));}catch(e){next(e);}});
router.post('/',async(req,res,next)=>{
  try{
    const name=String(req.body.name||'').trim();
    const ids=Array.isArray(req.body.clothingItemIds)?req.body.clothingItemIds:[];
    if(!name||!ids.length)return res.status(400).json({message:'Outfit name and at least one clothing item are required.'});
    if(ids.some(id=>!mongoose.isValidObjectId(id)))return res.status(400).json({message:'One or more clothing IDs are invalid.'});
    const count=await ClothingItem.countDocuments({_id:{$in:ids},owner:req.user.id});
    if(count!==new Set(ids.map(String)).size)return res.status(400).json({message:'Outfit includes items not owned by this user.'});
    const outfit=await Outfit.create({owner:req.user.id,name,occasion:req.body.occasion||'Casual',clothingItemIds:ids,plannedDate:req.body.plannedDate||null});
    res.status(201).json(await outfit.populate('clothingItemIds'));
  }catch(e){next(e);}
});
router.param('id',(req,res,next,id)=>{if(!mongoose.isValidObjectId(id))return res.status(400).json({message:'Invalid outfit ID.'});next();});
router.patch('/:id',async(req,res,next)=>{
  try{
    const updates={};
    for(const k of ['name','occasion','plannedDate','status'])if(k in req.body)updates[k]=req.body[k];
    if('clothingItemIds' in req.body){
      if(!Array.isArray(req.body.clothingItemIds)||req.body.clothingItemIds.some(id=>!mongoose.isValidObjectId(id)))return res.status(400).json({message:'Invalid clothing item list.'});
      const count=await ClothingItem.countDocuments({_id:{$in:req.body.clothingItemIds},owner:req.user.id});
      if(count!==new Set(req.body.clothingItemIds.map(String)).size)return res.status(400).json({message:'Outfit includes items not owned by this user.'});
      updates.clothingItemIds=req.body.clothingItemIds;
    }
    const outfit=await Outfit.findOneAndUpdate({_id:req.params.id,owner:req.user.id},updates,{new:true,runValidators:true}).populate('clothingItemIds');
    if(!outfit)return res.status(404).json({message:'Outfit not found.'});res.json(outfit);
  }catch(e){next(e);}
});
router.delete('/:id',async(req,res,next)=>{try{const outfit=await Outfit.findOneAndDelete({_id:req.params.id,owner:req.user.id});if(!outfit)return res.status(404).json({message:'Outfit not found.'});res.json({message:'Outfit deleted.'});}catch(e){next(e);}});
router.post('/:id/wear',async(req,res,next)=>{
  try{
    const outfit=await Outfit.findOne({_id:req.params.id,owner:req.user.id});
    if(!outfit)return res.status(404).json({message:'Outfit not found.'});
    const now=new Date();outfit.wornAt.push(now);outfit.status='worn';await outfit.save();
    await ClothingItem.updateMany({_id:{$in:outfit.clothingItemIds},owner:req.user.id},{$inc:{wearCount:1}});
    res.json({message:'Outfit marked as worn.',outfit});
  }catch(e){next(e);}
});
export default router;

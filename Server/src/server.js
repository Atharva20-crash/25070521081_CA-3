import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import clothingRoutes from './routes/clothing.js';
import outfitRoutes from './routes/outfits.js';
import { authRequired } from './middleware/auth.js';
import ClothingItem from './models/ClothingItem.js';
import Outfit from './models/Outfit.js';

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req,res)=>res.json({ok:true,service:'WardrobeWise API'}));
app.use('/api/auth', authRoutes);
app.use('/api/clothing', clothingRoutes);
app.use('/api/outfits', outfitRoutes);

app.get('/api/dashboard', authRequired, async (req,res,next)=>{
  try {
    const [items,outfits] = await Promise.all([
      ClothingItem.find({owner:req.user.id}).lean(),
      Outfit.countDocuments({owner:req.user.id})
    ]);
    res.json({totalItems:items.length,totalOutfits:outfits,totalWears:items.reduce((n,i)=>n+i.wearCount,0),favorites:items.filter(i=>i.favorite).length});
  } catch(e){next(e);}
});

app.post('/api/recommendations', authRequired, async (req,res,next)=>{
  try {
    const occasion = String(req.body.occasion || 'Casual');
    const items = await ClothingItem.find({owner:req.user.id}).lean();
    const rank = (i) => (i.occasions?.includes(occasion)?35:0) + (i.season==='All season'?20:10) + (i.color?15:0) + (i.style?10:0) - Math.min(i.wearCount,20);
    const tops=items.filter(i=>i.category==='Tops').sort((a,b)=>rank(b)-rank(a));
    const bottoms=items.filter(i=>['Bottoms','Dresses'].includes(i.category)).sort((a,b)=>rank(b)-rank(a));
    const shoes=items.filter(i=>i.category==='Shoes').sort((a,b)=>rank(b)-rank(a));
    const result=[tops[0],bottoms[0],shoes[0]].filter(Boolean);
    res.json({occasion,items:result,score:result.length?Math.min(100,Math.round(result.reduce((s,i)=>s+rank(i),0)/result.length)):0,explanation:'Ranked using occasion, season, item attributes, and wear history. This is a rule-based recommendation, not a trained ML model.'});
  } catch(e){next(e);}
});

app.use((err,_req,res,_next)=>{
  console.error(err);
  const status=err.status||500;
  res.status(status).json({message:status===500?'Something went wrong on the server.':err.message});
});

const port=Number(process.env.PORT)||5000;
const start=async()=>{
  try{
    if(!process.env.MONGODB_URI) throw new Error('MONGODB_URI is missing. Copy .env.example to server/.env and configure it.');
    await mongoose.connect(process.env.MONGODB_URI);
    app.listen(port,()=>console.log(`WardrobeWise API listening on http://localhost:${port}`));
  }catch(e){console.error('Startup failed:',e.message);process.exit(1);}
};
start();

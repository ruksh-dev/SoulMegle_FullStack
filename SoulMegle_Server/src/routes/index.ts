import {Router} from 'express'
import passport from 'passport'
import checkAuth from '../middlewares/checkAuth'
import getUser from '../middlewares/getUser'
import processUserTraits from '../middlewares/processUserTraits'
import addUser from '../services/addUser'
import checkEmbeddingsExist from '../middlewares/checkEmbeddingsExist'
import multer from "multer";
const storage = multer.memoryStorage();
const upload = multer({ storage });
const router=Router();

router.get('/user/auth/google', (req:any,res:any,next:any)=>{
        const redirectUrl = req.query.redirectUrl || 'http://localhost:5173';
        passport.authenticate('google', {
                scope: ['profile', 'email'],
               state: JSON.stringify({redirectUrl})
        })(req,res,next)
});

router.get('/auth/google/redirect',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, redirect home.
    const state = JSON.parse(req.query.state as string || '{}');
    const redirectUrl = state.redirectUrl || 'http://localhost:5173';
    // Successful authentication, redirect to the original URL.
    res.redirect('https://test-soulmegle.vercel.app');
  }
);

router.get('/logout', (req, res, next) => {
        const redirectUrl = req.query.redirectUrl as string || 'http://localhost:5173';
        console.log('url: ',redirectUrl);
        req.logout(err=>{
    if(err) return next(err);
  });
  res.redirect('https://test-soulmegle.vercel.app');
});

// protected routes
router.get('/api/user',checkAuth,getUser);
router.post('/api/user/process-user-traits',checkAuth,upload.single('audio'), processUserTraits);
router.get('/api/user/add',checkAuth,addUser);
router.get('/api/user/check-traits',checkAuth,checkEmbeddingsExist)

export const AllRoutes=router;
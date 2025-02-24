import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import {prisma} from '../db/index'
import {config} from 'dotenv'
import {resolve} from 'path'
config({path: resolve(__dirname,'../../../.env')})

const googleStrategy=()=>{
  passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: process.env.CALLBACK_URL!,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    if(!profile.emails) throw Error('invalid profile')
    let user = await prisma.user.findUnique({
      where: { email: profile.emails[0].value },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: profile.emails[0].value,
          username: profile.displayName,
        },
      });
    }

    return done(null, user);
  } catch (error) {
    return done(error, undefined);
  }
}));

passport.serializeUser((user: any, done) => { 
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
}
export default googleStrategy;
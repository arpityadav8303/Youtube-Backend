import { Router } from 'express';
import { registerUser,loginUser,logOutUser } from '../controllers/user.controller.js'; // ✅ Make sure this is imported
import {upload} from '../middlewares/multer.middleware.js'
import { verifyJWT } from '../middlewares/auth.middleware.js';


const router = Router();

router.route('/register').post(
    upload.fields([
        {name:"avatar",maxCount:1},
        {name:"coverimage",maxCount:1},
        
    ]),
    registerUser
); // ✅ Correct URL path

router.route('/login').post(loginUser);
//secured routes
router.route('/logout').post(verifyJWT,logOutUser);
router.route('/refresh').post(refreshAccessToken);
export default router; // ✅ Export the router
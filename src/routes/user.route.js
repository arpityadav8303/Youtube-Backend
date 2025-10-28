import { Router } from 'express';
import { registerUser } from '../controllers/user.controller.js'; // ✅ Make sure this is imported
import {upload} from '../middlewares/multer.middleware.js'


const router = Router();

router.route('/register').post(
    upload.fields([
        {name:"avatar",maxCount:1},
        {name:"coverimage",maxCount:1},
        
    ]),
    registerUser
); // ✅ Correct URL path

export default router; // ✅ Export the router
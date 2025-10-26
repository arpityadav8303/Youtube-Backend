import { Router } from 'express';
import { registerUser } from '../controllers/user.controller.js'; // ✅ Make sure this is imported

const router = Router();

router.route('/register').post(registerUser); // ✅ Correct URL path

export default router;
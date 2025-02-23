import express from 'express';
import { convertToKatakana } from '../controllers/convertKatakanaController';
const router = express.Router();

router.post('/convertKatakana',convertToKatakana);

export default router;
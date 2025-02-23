import express from 'express';
import { 
    getCustomerList
    ,saveCustomer
    ,getCusInfo 
    ,getGenbaList
    ,canbeCancelled
    ,customermasterDelete
    ,customermasterUndelete
} from "../controllers/customerControllers";
const router = express.Router();

router.post('/getCustomerList',getCustomerList);
router.post('/saveCustomer',saveCustomer);
router.post('/getCusInfo',getCusInfo);
router.post('/getGenbaList',getGenbaList);
router.post('/canbeCancelled',canbeCancelled);
router.post('/customermasterDelete',customermasterDelete);
router.post('/customermasterUndelete',customermasterUndelete);

export default router;
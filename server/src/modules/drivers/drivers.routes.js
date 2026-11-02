import { Router } from 'express';
import { requireAdmin, requireAuth } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { idParams } from '../../utils/schemas.js';
import * as controller from './drivers.controller.js';
import { createDriverSchema, listDriversQuery, rateDriverSchema } from './drivers.schema.js';

const router = Router();
router.use(requireAuth);

router.get('/', validate(listDriversQuery, 'query'), controller.list);
router.post('/', validate(createDriverSchema), controller.create);
router.get('/:id', validate(idParams, 'params'), controller.get);
router.post('/:id/rate', validate(idParams, 'params'), validate(rateDriverSchema), controller.rate);
router.patch('/:id/verify', requireAdmin, validate(idParams, 'params'), controller.verify);
router.delete('/:id', requireAdmin, validate(idParams, 'params'), controller.reject);

export default router;

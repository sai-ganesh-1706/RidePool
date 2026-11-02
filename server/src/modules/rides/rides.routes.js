import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { idParams } from '../../utils/schemas.js';
import * as controller from './rides.controller.js';
import {
  completeRideSchema,
  createRideSchema,
  listRidesQuery,
  paymentParams,
  paymentSchema,
  setDriverSchema,
  suggestionsQuery,
} from './rides.schema.js';

const router = Router();
router.use(requireAuth);

const withId = validate(idParams, 'params');

// Static paths must be registered before "/:id"
router.get('/', validate(listRidesQuery, 'query'), controller.list);
router.get('/my', controller.listMine);
router.get('/suggestions', validate(suggestionsQuery, 'query'), controller.suggestions);
router.post('/', validate(createRideSchema), controller.create);

router.get('/:id', withId, controller.get);
router.post('/:id/join', withId, controller.join);
router.post('/:id/leave', withId, controller.leave);
router.post('/:id/cancel', withId, controller.cancel);
router.patch('/:id/driver', withId, validate(setDriverSchema), controller.setDriver);
router.post('/:id/complete', withId, validate(completeRideSchema), controller.complete);
router.patch(
  '/:id/members/:userId/payment',
  validate(paymentParams, 'params'),
  validate(paymentSchema),
  controller.setPayment,
);
router.get('/:id/messages', withId, controller.messages);

export default router;

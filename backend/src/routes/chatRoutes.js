import { Router } from 'express';
import {
  listConversations,
  createConversation,
  getConversation,
  getMessages,
  markRead,
} from '../controllers/chatController.js';
import { protect } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import {
  createConversationSchema,
  idParamSchema,
  messageQuerySchema,
  conversationQuerySchema,
} from '../validations/chatValidation.js';

const router = Router();

router.use(protect);

router.get('/', validate(conversationQuerySchema, 'query'), listConversations);
router.post('/', validate(createConversationSchema), createConversation);
router.get('/:id', validate(idParamSchema, 'params'), getConversation);
router.get('/:id/messages', validate(idParamSchema, 'params'), validate(messageQuerySchema, 'query'), getMessages);
router.put('/:id/read', validate(idParamSchema, 'params'), markRead);

export default router;
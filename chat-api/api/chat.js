import { handleChat } from '../lib/handler.js';
import { generateWithFailover } from '../lib/providers.js';

export default {
  fetch(request) {
    return handleChat(request, {
      generateAnswer(params) {
        return generateWithFailover(params);
      }
    });
  }
};

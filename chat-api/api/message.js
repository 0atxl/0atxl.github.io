import { handleMessage } from '../lib/message.js';

export default {
  fetch(request) {
    return handleMessage(request);
  }
};

export default {
  fetch() {
    return Response.json({ error: 'The hosted portfolio chat has been retired.' }, { status: 410 });
  }
};

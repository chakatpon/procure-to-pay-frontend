module.exports = function (server, handle) {
  server.post('/login/', async (req, res) => {
    req.session.set('token', {
      id: 230,
      admin: true,
    });
    await req.session.save();
    return res.json({ status: 'success' });
  });
};

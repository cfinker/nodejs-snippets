var express = require('express');
var router = express.Router();
const snippetController = require('../controllers').snippet;

router.get('/snippets', snippetController.list);
router.get('/snippets/:id', snippetController.getById);
router.post('/snippets', snippetController.add);
router.put('/snippets/:id', snippetController.update);
router.delete('/snippets/:id', snippetController.delete);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.json({msg: 'Hello World!'});
});



module.exports = router;

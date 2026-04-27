'use strict';
const express = require('express');
const path = require('path');
const router = express.Router();

const publicDir = path.resolve(__dirname, '..', '..', '..', 'public', 'gantt');

router.use('/gantt', express.static(publicDir));

exports.default = router;

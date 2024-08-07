"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get('/', (req, res) => {
    res.send('This is the GET route');
});
router.post('/', (req, res) => {
    res.send('This is the POST route');
});
exports.default = router;

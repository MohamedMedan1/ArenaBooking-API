import express from "express";
import { login, register } from "../controllers/authController";
import Client from "../models/clientModel";

const router = express.Router();

// =====  Authentication Routes =====
router.post("/login",login(Client));
router.post("/register", register(Client));


export default router;
import { Router } from "express";
import { validateSchema } from "../middlewares/validateSchemas";
import { clientSchema } from "../schemas/client";
import { createClient, getClients } from "../controllers/clients";

const router = Router();

router.post("/clients", validateSchema(clientSchema), createClient);
router.get("/clients", getClients);

export default router;
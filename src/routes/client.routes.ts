import { Router } from "express";
import { validateSchema } from "../middlewares/validateSchemas";
import { clientSchema, updateClientSchema } from "../schemas/client";
import {
	createClient,
	deleteClient,
	getClients,
	updateClients,
} from "../controllers/clients";

const router = Router();

router.post("/clients", validateSchema(clientSchema), createClient);
router.get("/clients", getClients);
router.put("/clients/:id", validateSchema(updateClientSchema), updateClients);
router.delete("/clients/:id", deleteClient);

export default router;

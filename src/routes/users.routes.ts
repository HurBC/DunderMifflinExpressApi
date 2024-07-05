import { Router } from "express";
import { validateSchema } from "../middlewares/validateSchemas";
import { insertManySchema, registerSchema, updateUserSchema } from "../schemas/user";
import { deleteUser, getQuery, getUsers, insertMany, register, updateUser } from "../controllers/users";
import { z } from "zod";

const router = Router();

router.get("/users", getUsers);
router.get("/users-by", getQuery);
router.post("/users", validateSchema(registerSchema), register);
router.post("/users/bulk", validateSchema(insertManySchema), insertMany);
router.put("/users", validateSchema(updateUserSchema), updateUser);
router.delete("/users", deleteUser);

export default router;
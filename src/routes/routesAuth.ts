import { Router } from "express";
import dotenv from "dotenv";
import { ObjectId } from "mongodb";
import { getDb } from "../mongo";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


dotenv.config();

const router = Router();

const SECRET = process.env.SECRET;

type User = {
    _id?: ObjectId,
    email: string,
    password: string
}

const coleccion = () => getDb().collection("Users");


router.post('/register', async (req, res) => {

    try {

        const { email, password } = req.body as User;
        const exists = await coleccion().findOne({ email: email });
        if (exists) return res.status(404).json({ message: "Ya existe un usuario con este email" });

        const passwordEncrypted = await bcrypt.hash(password, 10);
        await coleccion().insertOne({ email: email, password: passwordEncrypted });

        res.status(201).json({ message: "Usuario registrado existosamente" });

    } catch (err: any) {
        res
            .status(500)
            .json({ message: "Error al registrar usuario", detail: err.message })
    }

})


router.post('/login', async (req, res) => {

    try {
        const { email, password } = req.body as User;
        const user = await coleccion().findOne({ email: email });
        if (!user) return res.status(404).json({ message: "No existe un usuario con este email" });

        const valid = bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ message: "Contraseña incorrecta" });

        const token = jwt.sign({ id: user._id, email: user.email }, SECRET as string, {
            expiresIn: "1h"
        });

        res.status(200).json({ message: "Login correcto", token: "Beaver " + token });

    } catch (err: any) {
        res
            .status(500)
            .json({ message: "Error al logearse", detail: err.message })
    }
})


export default router;
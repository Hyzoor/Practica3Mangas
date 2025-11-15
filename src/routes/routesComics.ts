import { Router } from "express";
import { getDb } from "../mongo";
import validateComic from "../utils/validateComics";
import { Comic, DataValidated } from "../types";
import { AuthRequest, verifyToken } from "../utils/verifyToken";
import { ObjectId } from "mongodb";

const router = Router();
const coleccion = () => getDb().collection("Comics");

// ------ Rutas Publicas ---------

router.get('/public', async (req, res) => {

    try {

        const page = Number(req.query?.page) || 1;
        const limit = Number(req.query?.limit) || 5;
        const skip = (page - 1) * limit;

        const data = await coleccion().aggregate([
            {
                $group: {
                    _id: "$titulo",
                    autor: { $first: "$autor" },
                    publisher: { $first: "$publisher" },
                    year: { $first: "$year" },
                    popularity: { $sum: 1 } // cuenta cuántos comics hay de este título
                }
            },
            { $sort: { popularity: -1 } } // más populares primero
        ]).skip(skip).limit(limit).toArray();


        const initial: DataValidated = { results: [], invalids: [] };

        const dataValidated = data.reduce((accum, i) => {

            const error = validateComic(i);
            if (error.length) accum.invalids.push({ id: i._id.toString(), errors: error });
            else accum.results.push(i);

            return accum;

        }, initial);

        res.json({
            info: {
                page: page,
                numberOfComicsInPage: limit,
            },
            result: dataValidated,
        });

    } catch (err: any) {
        res
            .status(500)
            .json({ message: "Error al obtener comics populares", detail: err.message });
    }

})


// ------ Rutas Privadas ---------

router.use(verifyToken);

router.get('/', async (req: AuthRequest, res) => {

    const page = Number(req.query?.page) || 1;
    const limit = Number(req.query?.limit) || 5;
    const skip = (page - 1) * limit;

    try {

        const data = await coleccion().find({ userId: req.user?.id }).skip(skip).limit(limit).toArray();
        const initial: DataValidated = { results: [], invalids: [] };

        const dataValidated = data.reduce((accum, i) => {

            const error = validateComic(i);
            if (error.length) accum.invalids.push({ id: i._id.toString(), errors: error });
            else accum.results.push(i);

            return accum;

        }, initial);


        res.json({
            info: {
                page: page,
                numberOfComicsInPage: limit,
            },
            result: dataValidated,
        });

    } catch (err: any) {
        res
            .status(500)
            .json({ message: "Error al obtener comics", detail: err.message });
    }

});


router.post('/', async (req: AuthRequest, res) => {

    try {
        const error = validateComic(req.body);

        if (error.length) res.status(400).json({ error });

        const comicNuevo: Comic = {
            ...req.body,
            userId: req.user?.id
        }

        const result = await coleccion().insertOne(comicNuevo);
        const comicInsertado = await coleccion().findOne({ _id: result.insertedId });

        res.status(201).json(comicInsertado);

    } catch (err: any) {
        res
            .status(500)
            .json({ message: "Error al postear el comic", detail: err.message });
    }
});

router.put('/:id', async (req: AuthRequest, res) => {

    try {

        const idModificar = new ObjectId(req.params.id);

        const comic = await coleccion().findOne({ _id: idModificar });

        if (!comic) return res.status(404).json({ message: "Comic a modificar no encontrado" });

        const error = validateComic(req.body);
        if (error.length) return res.status(404).json({ error });

        const result = await coleccion().updateOne({ _id: idModificar }, { $set: req.body });
        res.json(result);

    } catch (err: any) {
        res
            .status(500)
            .json({ message: "Error al modificar el comic", detail: err.message });
    }

});

router.delete('/:id', async (req: AuthRequest, res) => {


    try {

        const idEliminar = new ObjectId(req.params.id);

        const comic = await coleccion().findOne({ _id: idEliminar });
        if (!comic) return res.status(404).json({ message: "Comic a eliminar no encontrado" });

        const result = await coleccion().deleteOne({ _id: idEliminar });

        res.json(result);

    } catch (err: any) {
        res
            .status(500)
            .json({ message: "Error al eliminar el comic", detail: err.message });
    }

});

export default router;
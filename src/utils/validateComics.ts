import { Comic } from "../types";

const validateComic = (data: any): string[] => {


    if (!data) return ["No se ha introducido ningun dato en el body"];


    const errores: string[] = [];
    const updates: Partial<Comic> = data;

    if ("titulo" in updates && typeof (updates.titulo) !== "string") errores.push("Titulo ha de ser una cadena de caracteres");
    if ("autor" in updates && typeof (updates.autor) !== "string") errores.push("Autor ha de ser una cadena de caracteres");
    if ("year" in updates && typeof (updates.year) !== "number") errores.push("El año ha de ser un numero");
    if ("publisher" in updates && typeof (updates.publisher) !== "string") errores.push("El publisher ha de ser una cadena de caracteres");
    if ("status" in updates && data.status !== "Leido" && data.status !== "Pendiente") errores.push("El status solo puede ser Leido o Pendiente");
    return errores;

}


export default validateComic;
export type Comic = {

    titulo: string,
    autor: string,
    year: number,
    publisher: string,
    userId: number,
    status?: "Leido" | "Pendiente"

}

export type DataValidated = {
    results: any[],
    invalids: {
        id: string,
        errors: string[]
    }[]
};
import express from "express";
import cors from "cors";
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.ts";

const { DATABASE_URL, PORT = 3000, FRONTEND_URL = "http://localhost:5173" } = process.env;

if (!DATABASE_URL) {
    console.error("Erro: a variável DATABASE_URL não está definida");
    process.exit(1);
}

const app = express();
const adapter = new PrismaPg({ connectionString: DATABASE_URL });
const prisma = new PrismaClient({ adapter });

app.use(express.json());
app.use(cors({ origin: FRONTEND_URL }));

app.get("/pessoa", async (req, res) => {
    try {
        const pessoas = await prisma.pessoa.findMany({ include: { cpf: true},  orderBy: { id: "asc" } });
        res.json(pessoas);
    } catch (erro) {
        res.status(500).json({ erro: erro.message });
    }
});

app.post("/pessoa", async (req, res) => {
    try {
        const { nome, email, cpf, numero_cpf } = req.body;
        const numeroCpf = cpf || numero_cpf;

        const novaPessoa = await prisma.pessoa.create({
            data: {
                nome,
                email,
                cpf: numeroCpf ? { create: { numero_cpf: numeroCpf } } : undefined,
            },
            include: { cpf: true },
        });
        console.log(`Pessoa cadastrada com sucesso! ID: ${novaPessoa.id}`);
        res.status(201).json(novaPessoa);
    } catch (erro) {
        res.status(500).json({ erro: erro.message });
    }
});

app.delete("/pessoa/:id", async (req, res) =>{
    try{
        const id = Number(req.params.id);

        if(!Number.isInteger(id)){
           return res.status(400).json({ erro: "ID Inválido"});
        } await prisma.pessoa.delete({ where: {id}});
        res.json({ok: true});
    }catch(erro){
        if (erro.code === "P2025") {
            return res.status(404).json({ erro: "Pessoa não encontrada"});
        }
        res.status(500).json({erro: erro.message});
    }
})

app.put("/pessoa/:id", async(req,res) =>{
    const id = Number(req.params.id);

    if(!Number.isInteger(id)){
        return res.status(400).json({erro: "ID inválido"})
    }

    const {nome, email, cpf } = req.body;
    try{
        const pessoaAtualizada = await prisma.pessoa.update({
            where: { id },
            data: {
                nome, 
                email,
                cpf: cpf
                ? { upsert: { create: {numero_cpf: cpf}, update: { numero_cpf: cpf }}}
                : { delete: true}
            },
            include: { cpf: true}
        });
        res.json(pessoaAtualizada);
    } catch (erro){
        if (erro.code === "P2025"){
            return res.status(404).json({ erro: "Pessoa não encontrada"})
        }
        res.status(500).json({ erro:erro.message})
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});




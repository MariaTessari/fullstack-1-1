-- CreateTable
CREATE TABLE "Pessoa" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "Pessoa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cpf" (
    "id" SERIAL NOT NULL,
    "numero_cpf" TEXT NOT NULL,
    "pessoaId" INTEGER NOT NULL,

    CONSTRAINT "Cpf_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Pessoa_email_key" ON "Pessoa"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Cpf_numero_cpf_key" ON "Cpf"("numero_cpf");

-- CreateIndex
CREATE UNIQUE INDEX "Cpf_pessoaId_key" ON "Cpf"("pessoaId");

-- AddForeignKey
ALTER TABLE "Cpf" ADD CONSTRAINT "Cpf_pessoaId_fkey" FOREIGN KEY ("pessoaId") REFERENCES "Pessoa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

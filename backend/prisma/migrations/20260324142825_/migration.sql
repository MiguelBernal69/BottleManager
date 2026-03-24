/*
  Warnings:

  - The values [entregado] on the enum `EstadoVenta` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EstadoVenta_new" AS ENUM ('registrado', 'en_produccion', 'en_envio');
ALTER TABLE "ventas" ALTER COLUMN "estado" DROP DEFAULT;
ALTER TABLE "ventas" ALTER COLUMN "estado" TYPE "EstadoVenta_new" USING ("estado"::text::"EstadoVenta_new");
ALTER TYPE "EstadoVenta" RENAME TO "EstadoVenta_old";
ALTER TYPE "EstadoVenta_new" RENAME TO "EstadoVenta";
DROP TYPE "EstadoVenta_old";
ALTER TABLE "ventas" ALTER COLUMN "estado" SET DEFAULT 'registrado';
COMMIT;

-- CreateTable
CREATE TABLE "historial" (
    "id" SERIAL NOT NULL,
    "cliente_id" INTEGER NOT NULL,
    "botella_id" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio_total" DOUBLE PRECISION NOT NULL,
    "notas" TEXT,
    "entregado_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historial_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "historial" ADD CONSTRAINT "historial_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial" ADD CONSTRAINT "historial_botella_id_fkey" FOREIGN KEY ("botella_id") REFERENCES "botellas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

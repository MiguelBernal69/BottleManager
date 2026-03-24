-- CreateEnum
CREATE TYPE "EstadoVenta" AS ENUM ('registrado', 'en_produccion', 'en_envio', 'entregado');

-- CreateTable
CREATE TABLE "clientes" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT,
    "telefono" TEXT,
    "direccion" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "botellas" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "tamano" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "forma" TEXT NOT NULL,
    "material" TEXT,
    "precio_base" DOUBLE PRECISION NOT NULL,
    "descripcion" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "botellas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ventas" (
    "id" SERIAL NOT NULL,
    "cliente_id" INTEGER NOT NULL,
    "botella_id" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "precio_total" DOUBLE PRECISION NOT NULL,
    "estado" "EstadoVenta" NOT NULL DEFAULT 'registrado',
    "notas" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ventas_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ventas" ADD CONSTRAINT "ventas_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventas" ADD CONSTRAINT "ventas_botella_id_fkey" FOREIGN KEY ("botella_id") REFERENCES "botellas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

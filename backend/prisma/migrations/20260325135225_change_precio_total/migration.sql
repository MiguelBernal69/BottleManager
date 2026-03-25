-- CreateEnum
CREATE TYPE "EstadoPedido" AS ENUM ('pendiente', 'en_produccion', 'en_envio', 'entregado', 'cancelado');

-- CreateEnum
CREATE TYPE "DepartamentoE" AS ENUM ('cochabamba', 'santa_cruz', 'pando', 'beni', 'la_paz', 'oruro', 'potosi', 'sucre', 'tarija');

-- CreateEnum
CREATE TYPE "Pago" AS ENUM ('qr', 'al_contado', 'credito');

-- CreateTable
CREATE TABLE "clientes" (
    "id" SERIAL NOT NULL,
    "empresa" TEXT NOT NULL,
    "nombreCliente" TEXT,
    "telefono" TEXT,
    "direccion" TEXT,
    "departamento" "DepartamentoE" DEFAULT 'cochabamba',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productos" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "productos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "variantes_producto" (
    "id" SERIAL NOT NULL,
    "producto_id" INTEGER NOT NULL,
    "tamano_ml" INTEGER NOT NULL,
    "material" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "cantidad_paquete" INTEGER NOT NULL,
    "precio_sin_factura" DECIMAL(10,2) NOT NULL,
    "precio_con_factura" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "variantes_producto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedidos" (
    "id" SERIAL NOT NULL,
    "cliente_id" INTEGER NOT NULL,
    "variante_id" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio_unitario" DECIMAL(10,2) NOT NULL,
    "estado" "EstadoPedido" NOT NULL DEFAULT 'pendiente',
    "notas" TEXT,
    "totalPagar" DECIMAL(65,30),
    "codigoProduccion" TEXT,
    "codigoImprenta" TEXT,
    "metodoPago" "Pago" DEFAULT 'al_contado',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pedidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personalizaciones" (
    "id" SERIAL NOT NULL,
    "pedido_id" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "valor" TEXT NOT NULL,

    CONSTRAINT "personalizaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historial_pedidos" (
    "id" SERIAL NOT NULL,
    "pedido_id" INTEGER NOT NULL,
    "cliente_id" INTEGER,
    "movil_id" INTEGER,
    "pedido_data" JSONB NOT NULL,
    "total_sin_factura" DECIMAL(10,2) NOT NULL,
    "total_con_factura" DECIMAL(10,2) NOT NULL,
    "estado_final" TEXT NOT NULL,
    "entregado_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historial_pedidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entregas" (
    "id" SERIAL NOT NULL,
    "pedidoId" INTEGER NOT NULL,
    "movilId" INTEGER NOT NULL,
    "fechaSalida" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaEntrega" TIMESTAMP(3),

    CONSTRAINT "entregas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "moviles" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "placa" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "moviles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "variantes_producto_producto_id_tamano_ml_material_tipo_cant_key" ON "variantes_producto"("producto_id", "tamano_ml", "material", "tipo", "cantidad_paquete");

-- CreateIndex
CREATE INDEX "pedidos_cliente_id_estado_idx" ON "pedidos"("cliente_id", "estado");

-- CreateIndex
CREATE INDEX "historial_pedidos_entregado_at_idx" ON "historial_pedidos"("entregado_at");

-- CreateIndex
CREATE UNIQUE INDEX "entregas_pedidoId_key" ON "entregas"("pedidoId");

-- AddForeignKey
ALTER TABLE "variantes_producto" ADD CONSTRAINT "variantes_producto_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_variante_id_fkey" FOREIGN KEY ("variante_id") REFERENCES "variantes_producto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personalizaciones" ADD CONSTRAINT "personalizaciones_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entregas" ADD CONSTRAINT "entregas_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "pedidos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entregas" ADD CONSTRAINT "entregas_movilId_fkey" FOREIGN KEY ("movilId") REFERENCES "moviles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

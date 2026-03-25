import prisma from './prisma'

async function main() {
  console.log('Cargando productos y variantes...')

  // AGUA
  const agua = await prisma.producto.create({
    data: { nombre: 'Agua', descripcion: 'Agua purificada' }
  })

  const variantesAgua = [
    { tamanoMl: 250,  material: 'Plástico', tipo: 'Normal',    cantidadPaquete: 35, precioSinFactura: 3.5,  precioConFactura: 3.7  },
    { tamanoMl: 330,  material: 'Plástico', tipo: 'Normal',    cantidadPaquete: 30, precioSinFactura: 3.7,  precioConFactura: 3.9  },
    { tamanoMl: 400,  material: 'Plástico', tipo: 'Normal',    cantidadPaquete: 24, precioSinFactura: 6.4,  precioConFactura: 6.6  },
    { tamanoMl: 400,  material: 'Vidrio',   tipo: 'Normal',    cantidadPaquete: 24, precioSinFactura: 32.8, precioConFactura: 33.0 },
    { tamanoMl: 500,  material: 'Plástico', tipo: 'Normal',    cantidadPaquete: 20, precioSinFactura: 4.3,  precioConFactura: 4.5  },
    { tamanoMl: 530,  material: 'Plástico', tipo: 'Con gas',   cantidadPaquete: 20, precioSinFactura: 4.4,  precioConFactura: 4.6  },
    { tamanoMl: 600,  material: 'Plástico', tipo: 'Normal',    cantidadPaquete: 20, precioSinFactura: 4.4,  precioConFactura: 4.6  },
    { tamanoMl: 750,  material: 'Plástico', tipo: 'Normal',    cantidadPaquete: 20, precioSinFactura: 5.5,  precioConFactura: 5.7  },
    { tamanoMl: 1000, material: 'Plástico', tipo: 'Normal',    cantidadPaquete: 10, precioSinFactura: 6.5,  precioConFactura: 6.7  },
    { tamanoMl: 1000, material: 'Plástico', tipo: 'Alcalina',  cantidadPaquete: 10, precioSinFactura: 7.3,  precioConFactura: 7.5  },
    { tamanoMl: 1500, material: 'Plástico', tipo: 'Normal',    cantidadPaquete: 10, precioSinFactura: 6.8,  precioConFactura: 7.5  },
  ]

  for (const v of variantesAgua) {
    await prisma.varianteProducto.create({ data: { productoId: agua.id, ...v } })
  }

  // JUGOS
  const jugo = await prisma.producto.create({
    data: { nombre: 'Jugos', descripcion: 'Jugos naturales' }
  })

  const variantesJugo = [
    { tamanoMl: 330,  material: 'Plástico', tipo: 'Normal', cantidadPaquete: 30, precioSinFactura: 3.7,  precioConFactura: 3.9  },
    { tamanoMl: 600,  material: 'Plástico', tipo: 'Normal', cantidadPaquete: 20, precioSinFactura: 5.4,  precioConFactura: 5.6  },
    { tamanoMl: 1000, material: 'Plástico', tipo: 'Normal', cantidadPaquete: 10, precioSinFactura: 7.1,  precioConFactura: 7.3  },
    { tamanoMl: 1500, material: 'Plástico', tipo: 'Normal', cantidadPaquete: 10, precioSinFactura: 11.3, precioConFactura: 11.5 },
  ]

  for (const v of variantesJugo) {
    await prisma.varianteProducto.create({ data: { productoId: jugo.id, ...v } })
  }

  // ISOTÓNICOS
  const isotonico = await prisma.producto.create({
    data: { nombre: 'Isotónicos', descripcion: 'Bebidas isotónicas' }
  })

  const variantesIsotonico = [
    { tamanoMl: 600,  material: 'Plástico', tipo: 'Normal', cantidadPaquete: 20, precioSinFactura: 9.0,  precioConFactura: 9.3  },
    { tamanoMl: 750,  material: 'Plástico', tipo: 'Normal', cantidadPaquete: 20, precioSinFactura: 9.3,  precioConFactura: 9.8  },
    { tamanoMl: 1000, material: 'Plástico', tipo: 'Normal', cantidadPaquete: 10, precioSinFactura: 11.3, precioConFactura: 11.5 },
  ]

  for (const v of variantesIsotonico) {
    await prisma.varianteProducto.create({ data: { productoId: isotonico.id, ...v } })
  }

  console.log('✅ Productos y variantes cargados correctamente')
  console.log(`   - Agua: ${variantesAgua.length} variantes`)
  console.log(`   - Jugos: ${variantesJugo.length} variantes`)
  console.log(`   - Isotónicos: ${variantesIsotonico.length} variantes`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
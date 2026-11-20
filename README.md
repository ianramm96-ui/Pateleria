# 🎂 Rico e Doce Bakery - Prototipo Web para Pastelería Artesanal

Prototipo de sitio web moderno, interactivo y responsive para una pastelería artesanal y repostería de autor, inspirado en la estética vintage ilustrada y tonos rosa pastel de **Rico e Doce Bakery**.

## ✨ Características Principales

1. **Diseño Visual & Identidad de Marca**:
   - Paleta de colores dulce y refinada inspirada en la marca y logo (rosa pastel `#FFD7EF`, blanco malvavisco `#FFF7FB`, acentos mora/frambuesa `#D84C7B` y tipografía elegante con líneas oscuras de ilustración botánica/vintage).
   - Tipografía de alta gama: *Playfair Display* (títulos), *Dancing Script* (detalles de autor) y *Plus Jakarta Sans* (lectura limpia).
   - Logotipo oficial circular con mariposas y porción de torta artesanal.
   - 100% responsive para móviles, tablets y computadoras.

2. **Catálogo Interactivo**:
   - Filtros por categoría: *Tortas de Autor*, *Tartas & Pies*, *Petit Fours & Macarons*, *Boxes de Regalo*, *🌱 Sin TACC & Vegano*.
   - Buscador en tiempo real por ingredientes o nombre de producto.
   - Tarjetas con badging (*Más Vendida*, *Chef's Pick*, *Sin TACC*), información de porciones y precios.

3. **Modal de Vista Rápida (Quick View)**:
   - Galería de fotos del producto.
   - Detalle de ingredientes nobles y alérgenos destacados.
   - Consejos de conservación y selector de cantidad con agregado directo al carrito.

4. **Diseñador Interactivo de Tortas a Medida (Cake Builder)**:
   - **Paso 1:** Tamaño y porciones (Mini 6 porc., Mediana 15 porc., Grande 25 porc., Fiesta doble piso).
   - **Paso 2:** Bizcochuelo (Vainilla Bourbon, Chocolate Belga, Red Velvet, Carrot & Pecan).
   - **Paso 3:** Relleno gourmet (Dulce de leche colonial, Ganache 60%, Mascarpone, Crema Bariloche, Curd de limón).
   - **Paso 4:** Agregados crocantes (Nueces pecan caramelizadas, merenguitos, frutos rojos, chispas belgas).
   - **Paso 5:** Estilo de cobertura (Semi-naked botánica, Buttercream texturado, Drip cake con macarons, Merengue flameado).
   - **Paso 6:** Placa de chocolate dedicatoria y notas para el pastelero.
   - **Cotizador en vivo:** Calcula el precio en tiempo real según cada opción seleccionada y permite sumar la torta personalizada al carrito.

5. **Carrito de Compras Flotante (Slide-over Drawer)**:
   - Persistencia local automática (`localStorage` para no perder el pedido al recargar).
   - Ajuste de cantidades (+/-) y eliminación de ítems.
   - Selector de método de entrega (*Retiro gratuito en taller* vs *Envío a domicilio*).
   - Barra de progreso interactiva para envío gratis (con umbral configurable).
   - Sistema de cupones de descuento (prueba aplicando: `DOCE10` o `RICODOCE15`).
   - **Generador de Pedido para WhatsApp:** Arma un mensaje 100% formateado con emojis, cantidades, dedicatorias, totales y método de entrega listo para enviar con un solo clic.

6. **Secciones de Conversión & Confianza**:
   - Banner de anuncio superior con información de entrega.
   - Pilares de calidad (manteca pura, chocolate belga, horneado diario, packaging de lujo).
   - Historia del Taller & Filosofía de la pastelera.
   - Reseñas de clientes con fotos y estrellas.
   - Preguntas Frecuentes (FAQ) interactivas con acordeones desplegables.
   - Newsletter con cupón de bienvenida.
   - Botón flotante directo a WhatsApp.

---

## 🚀 Cómo Visualizar el Prototipo

No necesitas instalar **Node.js**, **Python** ni ningún paquete. Es totalmente autónomo:

1. Dirígete a la carpeta:
   `c:\Users\Ian Castro\Desktop\Pasteleria`
2. Haz **doble clic en `index.html`** (se abrirá automáticamente en tu navegador predeterminado: Chrome, Edge, Firefox, etc.).
3. ¡Listo! Todo funcionará al 100% de manera inmediata con conexión a internet (para cargar tipografías, íconos e imágenes de Unsplash).

---

## 🛠️ Personalización Rápida

- **Modificar o agregar productos:**
  Abre [js/products.js](file:///c:/Users/Ian%20Castro/Desktop/Pasteleria/js/products.js) y edita el arreglo `PRODUCTS_DATA`.
- **Modificar opciones de la torta a medida o precios:**
  En [js/products.js](file:///c:/Users/Ian%20Castro/Desktop/Pasteleria/js/products.js) puedes cambiar los tamaños, rellenos, adicionales y sus costos en `CUSTOM_CAKE_OPTIONS`.
- **Cambiar el número de WhatsApp para recibir pedidos:**
  En [js/app.js](file:///c:/Users/Ian%20Castro/Desktop/Pasteleria/js/app.js), busca la constante `phoneNumber` (por defecto `5491123456789`) y pon tu número con código de país.
- **Cambiar cupones de descuento:**
  En [js/app.js](file:///c:/Users/Ian%20Castro/Desktop/Pasteleria/js/app.js), en el objeto `AppState.validCoupons`.

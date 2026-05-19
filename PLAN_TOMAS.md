# 🧑 PLAN DE TRABAJO - TOMÁS

**Fecha:** 16 de mayo de 2026
**Duración:** 4-5 semanas
**Enfoque:** FULL STACK - Cada módulo completo (backend + frontend)

---

## 📋 TUS 6 MÓDULOS (EN ORDEN)

| # | Módulo | Qué es | Tiempo |
|---|--------|--------|--------|
| **1** | **Favoritos** | Botón ❤️ para guardar propiedades | 1 día |
| **2** | **Mis Búsquedas** | Guardar filtros de búsqueda + recibir alertas | 2 días |
| **3** | **Historial** | Registro de propiedades vistas | 1 día |
| **4** | **Analytics** | Panel de estadísticas y gráficos | 2 días |
| **5** | **Vigencia** | Control de vencimiento de propiedades | 2-3 días |
| **6** | **Notificaciones** | Sistema de avisos (campanita 🔔) | 3-4 días |

**Total:** ~11-13 días de trabajo

---

## 📖 EXPLICACIÓN DE TUS MÓDULOS (EN ORDEN)

---

### **MÓDULO 1: FAVORITOS**

**¿Qué es?**
Los usuarios pueden guardar propiedades que les gustan con un botón de corazón.

**¿Cómo funciona?**
1. Usuario ve una propiedad que le gusta
2. Hace clic en el botón ❤️
3. La propiedad se guarda en sus favoritos
4. Usuario puede ir a "/mis-favoritos" y ver todas las propiedades guardadas
5. Puede hacer clic nuevamente en ❤️ para quitarla

**¿Qué contendrá?**

**Parte del Backend:**
- **Modelo de Favorite:**
  - ID del usuario
  - ID de la propiedad
- **Endpoints:**
  - `POST /api/favorites`: Agregar a favoritos
  - `GET /api/favorites`: Listar favoritos del usuario
  - `DELETE /api/favorites/:id`: Quitar de favoritos
  - `GET /api/favorites/check/:propertyId`: Verificar si es favorito

**Parte del Frontend:**
- **Botón de favorito:**
  - En cada PropertyCard y en el detalle
  - Si no es favorito → 🤍 (corazón vacío)
  - Si es favorito → ❤️ (corazón lleno)
- **Página `/mis-favoritos`:**
  - Lista de todas las propiedades guardadas
  - Si no tiene favoritos → mensaje: "Aún no tienes favoritos"

**Archivos que crearás:**
- Backend: 2 archivos nuevos (model, handler)
- Frontend: 2 archivos nuevos (FavoriteButton, mis-favoritos page)

**Cómo probar que funciona:**
1. Ir al buscador de propiedades
2. Hacer clic en ❤️ de una propiedad
3. Ir a "/mis-favoritos" y ver la propiedad ahí
4. Hacer clic nuevamente en ❤️ y desaparece

---

### **MÓDULO 2: MIS BÚSQUEDAS**

**¿Qué es?**
Los usuarios pueden guardar sus filtros de búsqueda favoritos y recibir alertas cuando haya nuevas propiedades que coincidan.

**¿Cómo funciona?**
1. Usuario busca propiedades con filtros (Sopocachi, venta, $100k)
2. Hace clic en "Guardar búsqueda"
3. Le pone nombre: "Casas en Sopocachi"
4. El sistema guarda los filtros
5. Cada hora, el sistema verifica nuevas propiedades
6. Si hay coincidencias → Envía notificación
7. Usuario va a "/perfil" → Tab "Mis Búsquedas" y ve sus búsquedas guardadas

**¿Qué contendrá?**

**Parte del Backend:**
- **Modelo de SavedSearch:**
  - ID del usuario
  - Nombre de la búsqueda
  - Filtros guardados: {tipo, zona, precio_min, precio_max, habitaciones}
  - Fecha de creación
  - Si está activa (para recibir alertas)
- **Worker (proceso automático):**
  - Corre cada hora
  - Busca propiedades nuevas
  - Compara con búsquedas guardadas
  - Envía notificaciones si hay match
- **Endpoints:**
  - `POST /api/saved-searches`: Guardar búsqueda
  - `GET /api/saved-searches`: Listar búsquedas del usuario
  - `DELETE /api/saved-searches/:id`: Eliminar búsqueda
  - `PATCH /api/saved-searches/:id/toggle`: Activar/desactivar alertas
  - `GET /api/saved-searches/:id/matches`: Ver coincidencias actuales

**Parte del Frontend:**
- **En el buscador de propiedades:**
  - Botón "Guardar búsqueda" después de aplicar filtros
  - Modal para poner nombre a la búsqueda
- **Tab "Mis Búsquedas" en /perfil (ya existe, está vacía):**
  - Lista de búsquedas guardadas con nombre
  - Cuántas coincidencias hay ahora
  - Botones: "Ver coincidencias", "Pausar alertas", "Eliminar"
  - Toggle para activar/desactivar notificaciones

**Archivos:**
- Backend: 3 archivos nuevos (model, handler, worker)
- Frontend: 2 archivos nuevos (SaveSearchModal, actualizar tab en perfil)
- Modificar: Buscador de propiedades (agregar botón guardar)

**Cómo probar:**
1. Ir al buscador
2. Aplicar filtros (Sopocachi, venta, hasta $100k)
3. Hacer clic en "Guardar búsqueda"
4. Poner nombre "Casas Sopocachi baratas"
5. Ir a /perfil → Mis Búsquedas → Ver la búsqueda guardada
6. Crear propiedad que coincida
7. Recibir notificación

---

### **MÓDULO 3: HISTORIAL**

**¿Qué es?**
Registro automático de todas las propiedades que el usuario ha visto.

**¿Cómo funciona?**
1. Usuario entra a detalle de una propiedad
2. El sistema guarda automáticamente: qué propiedad vio, cuándo la vio
3. Usuario puede ir a "/perfil" → Tab "Historial"
4. Ve todas las propiedades que ha visto, ordenadas por fecha (más recientes primero)
5. Puede hacer clic en cualquier propiedad para volver a verla

**¿Qué contendrá?**

**Parte del Backend:**
- **Modelo de ViewHistory:**
  - ID del usuario
  - ID de la propiedad
  - Fecha y hora de la vista
- **Endpoints:**
  - `POST /api/view-history`: Registrar vista (automático)
  - `GET /api/view-history`: Listar historial del usuario (paginado)
  - `DELETE /api/view-history`: Limpiar historial
  - `DELETE /api/view-history/:id`: Eliminar una propiedad del historial

**Parte del Frontend:**
- **Automático en detalle de propiedad:**
  - Cuando usuario entra a /propiedades/[id], llamar a la API
- **Tab "Historial" en /perfil (ya existe, está vacía):**
  - Lista de propiedades vistas
  - Foto, título, precio, zona
  - "Visto hace: 2 horas", "Visto ayer", etc.
  - Botón "Limpiar historial"
  - Botón "Eliminar" en cada propiedad
  - Paginación (20 por página)

**Archivos:**
- Backend: 2 archivos nuevos (model, handler)
- Frontend: 1 archivo modificado (detalle de propiedad para registrar vista)
- Frontend: 1 archivo modificado (tab "Historial" en /perfil)

**Cómo probar:**
1. Entrar a detalle de 3 propiedades distintas
2. Ir a /perfil → Historial
3. Ver las 3 propiedades listadas
4. Ver "Visto hace X minutos"
5. Hacer clic en una y volver al detalle
6. Eliminar una del historial
7. Limpiar todo el historial

---

### **MÓDULO 4: ANALYTICS DASHBOARD**

**¿Qué es?**
Panel de estadísticas para que el admin vea cómo está funcionando el sistema.

**¿Qué mostrará?**
- Total de usuarios registrados
- Total de propiedades publicadas
- Propiedades activas vs. pendientes
- Ingresos del mes
- Gráfico: Propiedades por día
- Gráfico: Propiedades por tipo
- Gráfico: Ingresos por mes
- Tabla: Propiedades más vistas

**¿Qué contendrá?**

**Parte del Backend:**
- **Endpoint `/api/admin/analytics`:**
  - Cuenta total de usuarios
  - Cuenta total de propiedades
  - Suma de ingresos del mes
  - Agrupa propiedades por día, tipo, mes
  - Lista las 10 propiedades más vistas

**Parte del Frontend:**
- **Página `/admin/analytics`:**
  - 4 tarjetas con métricas principales
  - 3 gráficos (líneas y barras)
  - Tabla "Propiedades más vistas"

**Archivos:**
- Backend: 1 archivo nuevo (analytics handler)
- Frontend: 4 archivos nuevos (analytics page, StatCard, LineChart, BarChart)

**Cómo probar:**
1. Crear datos de prueba (propiedades, usuarios, pagos)
2. Ir a "/admin/analytics"
3. Ver los números y gráficos

---

### **MÓDULO 5: CONTROL DE VIGENCIA**

**¿Qué es?**
Las propiedades publicadas tienen un tiempo límite. Este módulo controla cuándo vencen y avisa a los usuarios.

**¿Cómo funciona?**
1. Usuario paga plan "Básico" (30 días)
2. Su propiedad se publica
3. **5 días antes de vencer:** Notificación: "Tu propiedad vence en 5 días. [Renovar]"
4. **1 día después de vencer:** Propiedad se desactiva automáticamente
5. Usuario puede pagar para renovar

**¿Qué contendrá?**

**Parte del Backend:**
- **Modelo de Subscription:**
  - Plan actual (Básico, Estándar, Premium)
  - Fecha de inicio y fin
  - Propiedades usadas vs. máximo permitido
- **Worker (proceso automático):**
  - Corre todos los días a las 3 AM
  - Busca propiedades que vencen en 5 días → Envia notificación
  - Busca propiedades vencidas → Las desactiva
- **Middleware:**
  - Antes de crear propiedad, verifica si puede
  - Si completó su plan → Mensaje: "Plan completo. [Mejorar plan]"

**Parte del Frontend:**
- **Página `/mi-suscripcion`:**
  - Tarjeta con plan actual
  - Fechas y días restantes
  - Barra de progreso: "Usaste 2 de 3 propiedades"
  - Botón "Renovar suscripción"

**Archivos:**
- Backend: 3 archivos nuevos (subscription model, worker, middleware)
- Frontend: 2 archivos nuevos (mi-suscripcion page, SubscriptionCard)

**Cómo probar:**
1. Crear propiedad y pagar plan Básico
2. Ir a "/mi-suscripcion" y ver datos
3. (En producción) Esperar a que vence y ver notificación

---

### **MÓDULO 6: NOTIFICACIONES**

**¿Qué es?**
Sistema de avisos para mantener a los usuarios informados.

**¿Qué notificaciones envía?**
- ✅ "Tu propiedad fue aprobada"
- ❌ "Tu propiedad fue rechazada: Motivo..."
- ⏰ "Tu propiedad vence en 5 días. [Renovar]"
- 👤 "Tienes un nuevo cliente interesado"
- 🔔 "Se te asignó una nueva propiedad"
- 💰 "Tu pago fue confirmado"
- 🔍 "¡Hay 3 nuevas propiedades que coinciden con tu búsqueda guardada!"

**¿Qué contendrá?**

**Parte del Backend:**
- **Modelo de Notification:**
  - ID del usuario
  - Tipo, título, mensaje
  - Si está leída o no
  - Fecha de creación
- **Función `sendNotification()`:**
  - Todos los módulos la llaman
  - Crea la notificación
- **Endpoints:**
  - `GET /api/notifications`: Listar
  - `PATCH /api/notifications/:id/read`: Marcar como leída
  - `PATCH /api/notifications/read-all`: Marcar todas
  - `GET /api/notifications/unread-count`: Contar no leídas

**Parte del Frontend:**
- **Campanita en el header (🔔):**
  - Badge rojo con número de no leídas
  - Dropdown con últimas 5 notificaciones
  - Botón "Marcar todas como leídas"
- **Página `/notificaciones`:**
  - Lista completa con filtros
  - Paginación (20 por página)

**Archivos:**
- Backend: 3 archivos (notification model, handler, service)
- Frontend: 3 archivos (NotificationCenter, NotificationDropdown, notificaciones page)

**Cómo probar:**
1. Juan hace alguna acción (publicar propiedad)
2. Recibir notificación
3. Ver la campanita con badge rojo
4. Hacer clic y ver la notificación

---

## 📅 PLAN SEMANAL

### **Semana 1: Favoritos**

**Tomás hará:**
- ✅ Favoritos completo (1 día)
  - Backend: modelo Favorite + endpoints
  - Frontend: botón ❤️ + página /mis-favoritos

**Juan hará (al mismo tiempo):**
- ✅ Marca 365Soft (1 día)
- ✅ Empieza Pagos backend (2 días)

**Ventaja:**
- Favoritos es totalmente independiente
- No espera nada de nadie
- Termina rápido y puede ayudar a Juan

**Viernes:**
- Code review mutuo
- Celebran 🎉

---

### **Semana 2: Mis Búsquedas + Historial + Analytics**

**Tomás hará:**
- ✅ Mis Búsquedas (2 días)
  - Backend: modelo SavedSearch + worker + endpoints
  - Frontend: botón "Guardar búsqueda" + tab en /perfil
- ✅ Historial (1 día)
  - Backend: modelo ViewHistory + endpoints
  - Frontend: registrar vistas + tab en /perfil
- ✅ Analytics (2 días)
  - Backend: endpoint /api/admin/analytics
  - Frontend: página /admin/analytics con gráficos

**Juan hará (al mismo tiempo):**
- ✅ Termina Pagos frontend (1 día)
- ✅ Asignación de Asesores (2.5 días)

**Ventaja:**
- Mis Búsquedas, Historial y Analytics son independientes
- No dependen de nadie
- Tomás avanza mientras Juan hace sus módulos

**Viernes:**
- Code review mutuo
- Prueban integración de módulos

---

### **Semana 3: Control de Vigencia**

**Tomás hará:**
- ✅ Control de Vigencia completo (2-3 días)
  - Backend: modelo Subscription + worker + middleware
  - Frontend: página /mi-suscripcion + tarjeta

**Juan hará (al mismo tiempo):**
- ✅ CRM completo (3.5 días)

**Ventaja:**
- Vigencia es independiente
- No necesita notificaciones todavía (las harás la semana 4)
- Tomás avanza sin esperar

**Viernes:**
- Code review mutuo
- Prueban flujos completos

---

### **Semana 4: Notificaciones**

**Tomás hará:**
- ✅ Notificaciones completo (3-4 días) ← ¡Al final!
  - Backend: modelo Notification + servicio + endpoints
  - Frontend: campanita 🔔 + página /notificaciones
  - Integrar con módulos de Juan (Asesores, CRM, Pagos, Vigencia)

**Juan hará (al mismo tiempo):**
- ✅ Integrar todos sus módulos con Notificaciones
- ✅ Pulidos de frontend

**Por qué al final:**
- Para cuando Tomás empiece, Juan YA habrá terminado:
  - Pagos → puede notificar "Pago confirmado"
  - Asesores → puede notificar "Nueva propiedad asignada"
  - CRM → puede notificar recordatorios
  - Vigencia → puede notificar "Tu propiedad vence pronto"

**Viernes:**
- Integración final de Notificaciones con todos los módulos
- Prueban que las notificaciones se envían correctamente
- Code review

---

### **Semana 5: Testing y Entrega**

**Tomás hará:**
- ✅ Testing E2E completo (2 días)
- ✅ Documentación (Swagger, manuales, 1 día)

**Juan hará:**
- ✅ Pulidos finales de frontend
- ✅ Corregir bugs

**AMBOS:**
- ✅ Verifican que los 10 módulos funcionen (4 de Juan + 6 de Tomás)
- ✅ Preparan presentación
- ✅ Hacen demo del sistema
- ✅ Entregan Trabajo Dirigido
- ✅ ¡CELEBRAN! 🎉🎊

---

## ✅ CHECKLIST FINAL (Tus 6 módulos - EN ORDEN)

**1. Favoritos ✅**
- [ ] Botón ❤️ funciona
- [ ] Tab "Favoritos" en /perfil lista propiedades
- [ ] Persiste correctamente

**2. Mis Búsquedas ✅**
- [ ] Botón "Guardar búsqueda" en buscador
- [ ] Tab "Mis Búsquedas" en /perfil muestra búsquedas guardadas
- [ ] Worker encuentra coincidencias cada hora
- [ ] Notifica cuando hay match

**3. Historial ✅**
- [ ] Registra automáticamente vistas de propiedades
- [ ] Tab "Historial" en /perfil muestra propiedades vistas
- [ ] Muestra "Visto hace X tiempo"
- [ ] Funciona limpiar historial
- [ ] Funciona eliminar propiedad del historial

**4. Analytics ✅**
- [ ] Admin ve métricas
- [ ] Gráficos se muestran
- [ ] Tabla de propiedades más vistas

**5. Control de Vigencia ✅**
- [ ] Worker corre a las 3 AM
- [ ] Notifica 5 días antes (usará notificaciones)
- [ ] Desactiva vencidas
- [ ] "Mi Suscripción" muestra datos correctos

**6. Notificaciones ✅**
- [ ] Campanita 🔔 con badge
- [ ] Dropdown muestra últimas 5
- [ ] Marcar como leída funciona
- [ ] Página /notificaciones funciona
- [ ] Integrada con Pagos, Asesores, CRM, Vigencia, Mis Búsquedas

---

## 💡 CONSEJOS

### **Para Tomás:**
- Trabaja independently, no dependes de Juan
- Pide code review cuando termines un módulo
- Controlas tu timeline
- Eres el "guardián de calidad" del proyecto

### **Testing (Tu rol importante):**
- Cuando termines un módulo, prueba los de Juan
- Tests de integración
- Tests E2E (extremo a extremo)
- Documentar bugs que encuentres

### **Comunicación:**
- Daily standup: 10min cada mañana (WhatsApp)
- "¿Qué hiciste ayer? ¿Qué harás hoy? ¿Bloques?"
- Code review los viernes
- Celebración de logros 🎉

---

**¿Listos? ¡Mucho éxito! 🚀**

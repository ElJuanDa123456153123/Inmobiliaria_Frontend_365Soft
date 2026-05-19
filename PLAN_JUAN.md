# 👤 PLAN DE TRABAJO - JUAN

**Fecha:** 16 de mayo de 2026
**Duración:** 4-5 semanas
**Enfoque:** FULL STACK - Cada módulo completo (backend + frontend)

---

## 📋 TUS 4 MÓDULOS

| # | Módulo | Qué es | Tiempo |
|---|--------|--------|--------|
| **1** | **Marca 365Soft** | Que se vea "365Soft" como vendedor | 1 día |
| **2** | **Asignación de Asesores** | Sistema para que asesores gestionen propiedades | 2-3 días |
| **3** | **Pagos con QR** | Generar códigos QR para cobros | 4-5 días |
| **4** | **CRM** | Sistema de gestión de clientes | 3-4 días |

**Total:** ~10-13 días de trabajo

---

## 📖 EXPLICACIÓN DE TUS MÓDULOS

---

### **MÓDULO 1: MARCA 365SOFT EN PROPIEDADES**

**¿Qué es?**
Cuando una persona (particular) publica su propiedad, el sistema debe mostrar que **365Soft es el vendedor**, NO el dueño de la propiedad.

**¿Por qué?**
Porque 365Soft es una inmobiliaria tradicional. Cuando un particular vende su casa, los interesados ven que "365Soft" vende, no el particular. Los asesores de 365Soft atienden y ganan comisión.

**¿Qué contendrá?**

**Parte del Backend (lo que pasa en el servidor):**
- Un archivo que decide qué vendedor mostrar:
  - Si el usuario es "particular" → mostrar **365Soft**
  - Si el usuario es "agente" o "inmobiliaria" → mostrar **sus datos**
- Cuando devuelves los datos de una propiedad, incluyes:
  - Nombre del vendedor
  - Logo de 365Soft (o del agente)
  - Teléfono de contacto
  - Email de contacto
  - Asesor asignado (si existe)

**Parte del Frontend (lo que ve el usuario):**
- Una tarjeta visual en el detalle de la propiedad que muestra:
  - Si es 365Soft: Logo, nombre "365Soft Inmobiliaria", teléfono central
  - Si es agente: Foto del agente, su nombre, su teléfono
  - Una bolita con la foto del asesor asignado
  - Botones: "Llamar", "WhatsApp"

**Archivos que crearás/modificarás:**
- Backend: 2 archivos modificados (property_dto.go, property_service.go)
- Frontend: 1 archivo modificado (página de detalle), 2 componentes nuevos (VendedorCard, AsesorBadge)

**Cómo probar que funciona:**
1. Crear una propiedad como "particular" → Debe ver "365Soft" como vendedor
2. Crear una propiedad como "agente" → Debe ver sus datos como vendedor
3. Verificar que el asesor asignado aparezca en la tarjeta

---

### **MÓDULO 2: ASIGNACIÓN DE ASESORES**

**¿Qué es?**
Sistema para que los asesores de 365Soft gestionen las propiedades que les asignan automáticamente.

**¿Cómo funciona?**
1. Un particular (ej: Juan) publica su propiedad
2. El sistema automáticamente elige un asesor (el que tiene menos propiedades)
3. El asesor recibe una notificación: "Tienes una nueva propiedad"
4. El asesor entra a su dashboard y ve la propiedad en "Por Gestionar"
5. El asesor contacta al dueño, mejora las fotos, la descripción
6. El asesor hace clic en "Activar Propiedad"
7. La propiedad se hace pública y todos la pueden ver

**¿Qué contendrá?**

**Parte del Backend:**
- Un "servicio de asignación" que:
  - Busca al asesor con MENOS propiedades activas
  - Le asigna la nueva propiedad automáticamente
  - Envía notificación al asesor
- Un endpoint para activar propiedades:
  - Solo el asesor puede activar
  - Cambia el estado de "en_revision" a "activa"

**Parte del Frontend:**
- Página `/asesor/mis-propiedades` con 3 secciones:
  1. **Por Gestionar:** Propiedades nuevas que el asesor debe revisar
  2. **Activas:** Propiedades que ya están publicadas
  3. **Vendidas:** Propiedades que ya se vendieron
- Cada propiedad muestra:
  - Foto principal
  - Título
  - Precio
  - Botón "Activar" (solo para las de "Por Gestionar")
- Un modal para ver detalles de la propiedad
- Métricas del asesor:
  - Cuántas propiedades vendió
  - Cuánta comisión ganó

**Archivos que crearás:**
- Backend: 1 servicio nuevo (assignment_service.go), 1 handler modificado
- Frontend: 1 página nueva, 2 componentes nuevos (PropertyCard, ActivarModal)

**Cómo probar que funciona:**
1. Publicar una propiedad como "particular"
2. El sistema la asigna a un asesor automáticamente
3. El asesor ve la propiedad en su dashboard
4. El asesor hace clic en "Activar"
5. La propiedad se hace pública

---

### **MÓDULO 3: SISTEMA DE PAGOS CON QR**

**¿Qué es?**
Sistema para cobrar a los usuarios cuando quieren publicar una propiedad. Genera un código QR que escanean con su app bancaria.

**¿Cómo funciona?**
1. Usuario termina de crear su propiedad
2. El sistema lo lleva a una página de planes:
   - **Básico:** Bs. 50 (1 propiedad, 30 días)
   - **Estándar:** Bs. 100 (3 propiedades, 60 días)
   - **Premium:** Bs. 200 (10 propiedades, 1 año)
3. Usuario selecciona un plan
4. El sistema llama al Banco Bisa y genera un código QR
5. Usuario escanea el QR con su app bancaria (Bisa, BCP, etc.)
6. Usuario paga
7. El Banco Bisa le avisa al sistema (webhook)
8. El sistema activa la propiedad

**¿Qué contendrá?**

**Parte del Backend:**
- **Modelo de Payment:** Guarda información del pago
  - ID de la propiedad
  - ID del usuario
  - Monto (Bs. 50, 100, o 200)
  - Estado: pendiente → completado
  - Código QR (imagen)
  - Fecha de expiración del QR (24 horas)
- **Servicio de Pago:**
  - `CreatePayment()`: Crea el pago y llama al Banco Bisa
  - `GenerateBisaQR()`: Genera el código QR
  - `ProcessWebhook()`: Recibe la confirmación del banco
- **Endpoints:**
  - `POST /api/payments/create`: Crear pago y generar QR
  - `GET /api/payments/:id/status`: Verificar si ya pagó
  - `POST /api/payments/webhook`: Banco Bisa avisa aquí

**Parte del Frontend:**
- **Página `/planes`:**
  - 3 tarjetas con los planes (Básico, Estándar, Premium)
  - Cada tarjeta muestra: precio, beneficios, botón "Seleccionar"
  - Usuario hace clic → va a página de pago
- **Página `/pagar/[id]`:**
  - Muestra el código QR grande
  - Instrucciones: "Escanea con tu app bancaria"
  - Contador regresivo: "Expira en 23:59:59"
  - El sistema verifica cada 10 segundos si ya pagó
  - Cuando paga → redirige a "/publicar/exito"
- **Página `/publicar/exito`:**
  - Mensaje: "¡Tu propiedad está publicada!"
  - Botón: "Ver mi propiedad"

**Archivos que crearás:**
- Backend: 5 archivos nuevos (models, repository, service, bisa service, handler)
- Frontend: 4 archivos nuevos/modified (planes, pagar, exito, mis-pagos)

**Cómo probar que funciona:**
1. Crear una propiedad
2. Seleccionar un plan
3. El sistema genera un QR
4. (En producción) Escanear y pagar
5. La propiedad se activa automáticamente

---

### **MÓDULO 4: CRM (GESTIÓN DE CLIENTES)**

**¿Qué es?**
Sistema para que los asesores gestionen a sus clientes/interesados.

**¿Cómo funciona?**
1. Un cliente interesado contacta por WhatsApp
2. El sistema crea automáticamente un "cliente" en el CRM
3. El asesor ve al cliente en su lista
4. El asesor registra: "Lo llamé, está interesado en ver la casa"
5. El sistema crea un "recordatorio": "Vuelve a llamar el 20 de mayo"
6. El asesor vende → Marca al cliente como "Cerrado"

**¿Qué contendrá?**

**Parte del Backend:**
- **Modelo de Client:**
  - Nombre del cliente
  - Teléfono, WhatsApp, Email
  - Estado: Nuevo, Contactado, Interesado, En negociación, Cerrado, Perdido
  - Origen: Web, WhatsApp, Referencia
  - Propiedad de interés
  - Notas
  - Próximo contacto (fecha)
- **Modelo de Interaction:**
  - Cliente asociado
  - Tipo: Llamada, WhatsApp, Email, Visita, Nota
  - Notas de la interacción
  - Fecha
  - Próximo contacto programado
- **Endpoints:**
  - `POST /api/crm/clients`: Crear cliente
  - `GET /api/crm/clients`: Listar clientes
  - `GET /api/crm/clients/:id`: Ver detalle
  - `POST /api/crm/clients/:id/interactions`: Registrar interacción
  - `GET /api/crm/stats`: Ver embudo de ventas

**Parte del Frontend:**
- **Página `/crm/clientes`:**
  - Métricas arriba:
    - "Total clientes: 45"
    - "Nuevos este mes: 12"
    - Embudo: Nuevos (15) → Contactados (20) → Interesados (8) → Cerrados (5)
  - Botón "+ Nuevo cliente"
  - Lista de clientes con filtros:
    - Filtro por estado
    - Buscador por nombre
  - Cada cliente muestra:
    - Nombre, teléfono
    - Badge con estado (azul=nuevo, verde=interesado, rojo=perdido)
    - Último contacto: "Hace 2 días"
- **Página `/crm/clientes/[id]` (detalle):**
  - Información del cliente
  - Historial de interacciones (timeline vertical):
    - 📞 "Llamada: Interesado en ver la casa" - hace 2 días
    - 💬 "WhatsApp: Envió más fotos" - hace 5 días
    - 🏠 "Visita: Visitó la propiedad, le gustó" - hace 1 semana
  - Botón "Registrar interacción"
  - Calendario para programar próximo contacto
- **Dashboard con embudo:**
  - Gráfico de embudo visual:
    ```
    Nuevos: 15
      ↓
    Contactados: 20
      ↓
    Interesados: 8
      ↓
    En negociación: 3
      ↓
    Cerrados: 5
    ```
  - Tasa de conversión: "33% (5 de 15)"

**Archivos que crearás:**
- Backend: 4 archivos nuevos (client model, interaction model, crm handler, service)
- Frontend: 6 archivos nuevos (clientes page, detalle page, ClientCard, Timeline, AddInteractionModal, Dashboard)

**Cómo probar que funciona:**
1. Crear un cliente manualmente
2. Registrar una interacción
3. Ver el historial en el timeline
4. Programar un próximo contacto
5. Cambiar el estado a "Cerrado"

---

## 📅 PLAN SEMANAL

### **Semana 1: Módulos simples**

**Juan hará:**
- ✅ Marca 365Soft (1 día)
- ✅ Empieza Pagos (backend, 2 días)
- ✅ Empieza Asignación de Asesores (backend, 2 días)

**Viernes:**
- Code review con Tomás
- Prueban que todo funciona
- Celebran lo logrado 🎉

---

### **Semana 2: Pagos y Asesores**

**Juan hará:**
- ✅ Termina Pagos (frontend, 1 día)
- ✅ Termina Asignación de Asesores (frontend, 1.5 días)
- ✅ Empieza CRM (backend, 2.5 días)

**Viernes:**
- Prueban el flujo completo: Publicar → Pagar → Activar
- Code review
- Planificación semana 3

---

### **Semana 3: CRM Completo**

**Juan hará:**
- ✅ Termina CRM (backend, 1 día)
- ✅ CRM Frontend completo (3 días)

**Viernes:**
- Prueban flujos completos de CRM
- Integración con otros módulos
- Code review

---

### **Semana 4: Integración y Pulidos**

**Juan hará:**
- ✅ Pulidos de frontend (responsive, animaciones)
- ✅ Integrar todos los módulos
- ✅ Corregir bugs encontrados

**Viernes:**
- Integración final con Tomás
- Prueban TODOS los flujos
- Corrigen bugs

---

### **Semana 5: Entrega final**

**AMBOS:**
- ✅ Verifican que los 9 módulos funcionen
- ✅ Corrigen bugs restantes
- ✅ Preparan presentación
- ✅ Hacen demo del sistema
- ✅ Entregan Trabajo Dirigido
- ✅ ¡CELEBRAN! 🎉🎊

---

## ✅ CHECKLIST FINAL (Tus 4 módulos)

**Marca 365Soft ✅**
- [ ] Particular publica → Se ve "365Soft" como vendedor
- [ ] Agente publica → Se ven sus datos
- [ ] Asesor asignado visible

**Asesores ✅**
- [ ] Asignación automática funciona
- [ ] Asesor ve "Por Gestionar" en su dashboard
- [ ] Asesor puede activar propiedad

**Pagos QR ✅**
- [ ] Usuario ve planes antes de publicar
- [ ] QR se genera
- [ ] Polling verifica estado cada 10s
- [ ] Webhook activa propiedad

**CRM ✅**
- [ ] Crear cliente funciona
- [ ] Timeline de interacciones visible
- [ ] Registrar interacción funciona
- [ ] Embudo de ventas se ve

---

## 💡 CONSEJOS

### **Para Juan:**
- Trabaja independently, no dependes de Tomás
- Pide code review cuando termines un módulo
- Controlas tu timeline
- Divide y vencerás: un módulo a la vez

### **Comunicación:**
- Daily standup: 10min cada mañana (WhatsApp)
- "¿Qué hiciste ayer? ¿Qué harás hoy? ¿Bloques?"
- Code review los viernes
- Celebración de logros 🎉

---

**¿Listos? ¡Mucho éxito! 🚀**

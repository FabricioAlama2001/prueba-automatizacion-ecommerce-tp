# TuPsicólogo E2E Checkout Monitor

Proyecto de automatización E2E con **Playwright + TypeScript** para validar el flujo de compra de TuPsicólogo.

El monitor permite ejecutar pruebas sobre los ambientes:

- **DEV:** `https://demo.dev.tupsicologo.com/`
- **QA:** `https://demo.test.tupsicologo.com/`
- **PROD:** `https://tupsicologo.com/`

El flujo principal valida:

1. Apertura del ecommerce.
2. Selección del plan individual de 1 sesión.
3. Selección de psicóloga/o y horario disponible.
4. Inicio de sesión.
5. Pago con tarjeta.
6. Aplicación opcional de cupón.
7. Captura del total cobrado.
8. Confirmación de compra.
9. Envío de correo de resultado usando Mailtrap.

---

## 1. Requisitos previos

Antes de instalar y ejecutar el proyecto en otro computador, validar que existan estas herramientas:

- Node.js
- npm
- Git

Validar versiones:

```bash
node -v
npm -v
git --version
```

Si alguno no existe, instalarlo antes de continuar.

---

## 2. Clonar el repositorio

### Opción recomendada: SSH

```bash
git clone git@github.com:FabricioAlama2001/prueba-automatizacion-ecommerce-tp.git
```

Entrar al proyecto:

```bash
cd prueba-automatizacion-ecommerce-tp
```

### Opción alternativa: HTTPS

```bash
git clone https://github.com/FabricioAlama2001/prueba-automatizacion-ecommerce-tp.git
cd prueba-automatizacion-ecommerce-tp
```

> Nota: si se usa HTTPS, GitHub puede pedir token. Para evitar ese drama innecesario, es mejor usar SSH.

---

## 3. Instalar dependencias del proyecto

```bash
npm install
```

---

## 4. Instalar navegadores de Playwright

```bash
npx playwright install
```

En Linux, si Playwright solicita dependencias del sistema:

```bash
npx playwright install --with-deps
```

---

## 5. Crear el archivo `.env`

El archivo `.env` contiene credenciales, datos de tarjeta de prueba y configuración sensible.  
**No debe subirse al repositorio.**

Crear el archivo a partir del ejemplo:

```bash
cp .env.example .env
```

Editar el archivo:

```bash
nano .env
```

También puede editarse desde WebStorm.

---

## 6. Plantilla del `.env`

Ejemplo de estructura recomendada:

```env
APP_ENV=qa

DEV_BASE_URL=https://demo.dev.tupsicologo.com/
QA_BASE_URL=https://demo.test.tupsicologo.com/
PROD_BASE_URL=https://tupsicologo.com/

BASE_URL=https://demo.test.tupsicologo.com/

TIMEZONE=America/Guayaquil

TEST_USER_EMAIL=
TEST_USER_PASSWORD=

PSYCHOLOGIST_NAME=Camila Pabón
PLAN_NAME=cita única
CONSULTATION_TYPE=Individual
SESSION_OFFSET_DAYS=15
SCHEDULE_SEARCH_MAX_DAYS=10

DISCOUNT_CODE=TESTMP
COMPLETE_PAYMENT=true
APPLY_DISCOUNT=true

CAPTURE_TOTAL_PAID=true
REQUIRE_TOTAL_PAID=true

PAYMENT_CARD_NUMBER=
PAYMENT_CARD_EXP_MONTH=
PAYMENT_CARD_EXP_YEAR=
PAYMENT_CARD_CVC=

MAIL_PROVIDER=mailtrap
MAILTRAP_HOST=sandbox.smtp.mailtrap.io
MAILTRAP_PORT=2525
MAILTRAP_USERNAME=
MAILTRAP_PASSWORD=
MAILTRAP_FROM=checkout-monitor@tupsicologo.test
MAILTRAP_TO=qa@tupsicologo.test

COUNTRY_RANDOM_ENABLED=true
COUNTRY_DEFAULT=Ecuador
```

---

## 7. Explicación de variables principales

### Ambiente

```env
APP_ENV=qa
BASE_URL=https://demo.test.tupsicologo.com/
```

Valores posibles:

```env
APP_ENV=dev
APP_ENV=qa
APP_ENV=prod
```

URLs por ambiente:

```env
DEV_BASE_URL=https://demo.dev.tupsicologo.com/
QA_BASE_URL=https://demo.test.tupsicologo.com/
PROD_BASE_URL=https://tupsicologo.com/
```

Uso recomendado:

- `dev`: primeras validaciones.
- `qa`: validación de flujo completo con cupón y pago de prueba.
- `prod`: solo si está autorizado. Producción no se toca por deporte.

---

### Usuario de prueba

```env
TEST_USER_EMAIL=
TEST_USER_PASSWORD=
```

Credenciales del usuario usado para iniciar sesión en el checkout.

---

### Psicóloga/o y agenda

```env
PSYCHOLOGIST_NAME=Camila Pabón
SESSION_OFFSET_DAYS=15
SCHEDULE_SEARCH_MAX_DAYS=10
```

- `PSYCHOLOGIST_NAME`: nombre de la psicóloga/o objetivo.
- `SESSION_OFFSET_DAYS`: días hacia adelante desde la fecha actual para iniciar la búsqueda.
- `SCHEDULE_SEARCH_MAX_DAYS`: días adicionales para buscar disponibilidad si la fecha inicial no tiene horario.

Ejemplo:

```env
SESSION_OFFSET_DAYS=15
SCHEDULE_SEARCH_MAX_DAYS=10
```

Esto indica que el monitor buscará una disponibilidad desde el día 15 en adelante, con una ventana adicional máxima de 10 días.

---

### Cupón

```env
DISCOUNT_CODE=TESTMP
APPLY_DISCOUNT=true
```

- `APPLY_DISCOUNT=true`: intenta aplicar el cupón configurado.
- `APPLY_DISCOUNT=false`: no aplica cupón.

Importante:

- El cupón puede no existir en todos los ambientes.
- En QA puede comportarse distinto a DEV.
- El test no debe asumir un valor fijo de descuento si el precio puede variar por país o moneda.

---

### Pago

```env
COMPLETE_PAYMENT=true
CAPTURE_TOTAL_PAID=true
REQUIRE_TOTAL_PAID=true
```

- `COMPLETE_PAYMENT=true`: completa el pago.
- `COMPLETE_PAYMENT=false`: llega hasta la página de pago, pero no finaliza.
- `CAPTURE_TOTAL_PAID=true`: captura el valor cobrado en la confirmación.
- `REQUIRE_TOTAL_PAID=true`: si no puede capturar el total cobrado, el test debe fallar.

Datos de tarjeta:

```env
PAYMENT_CARD_NUMBER=
PAYMENT_CARD_EXP_MONTH=
PAYMENT_CARD_EXP_YEAR=
PAYMENT_CARD_CVC=
```

Estos datos deben estar únicamente en `.env` o en secretos del pipeline.  
No deben subirse al repositorio.

---

### Mailtrap

```env
MAIL_PROVIDER=mailtrap
MAILTRAP_HOST=sandbox.smtp.mailtrap.io
MAILTRAP_PORT=2525
MAILTRAP_USERNAME=
MAILTRAP_PASSWORD=
MAILTRAP_FROM=checkout-monitor@tupsicologo.test
MAILTRAP_TO=qa@tupsicologo.test
```

Mailtrap se usa para enviar correos de éxito o error del monitor.

---

### País aleatorio

```env
COUNTRY_RANDOM_ENABLED=true
COUNTRY_DEFAULT=Ecuador
```

- `COUNTRY_RANDOM_ENABLED=true`: selecciona país aleatorio desde la lista configurada.
- `COUNTRY_RANDOM_ENABLED=false`: usa el país definido en `COUNTRY_DEFAULT`.

---

## 8. Validar compilación TypeScript

Antes de ejecutar las pruebas, validar que el proyecto compile:

```bash
npm run build
```

Si no aparecen errores, el proyecto está listo para ejecutar.

---

## 9. Ejecutar flujo principal en modo visible

Este comando abre el navegador y permite ver el flujo en pantalla:

```bash
npx playwright test tests/checkout/purchase-with-discount.spec.ts --project=chromium --headed
```

Este es el comando principal para pruebas manuales o depuración.

---

## 10. Ejecutar flujo principal en modo headless

Este modo ejecuta sin abrir navegador visual. Es útil para CI/CD o servidores:

```bash
npx playwright test tests/checkout/purchase-with-discount.spec.ts --project=chromium
```

---

## 11. Ejecutar prueba de Mailtrap

Sirve para validar que el envío de correos funciona:

```bash
npx playwright test tests/mailtrap-smoke.spec.ts --project=chromium
```

---

## 12. Ver reporte HTML de Playwright

Después de ejecutar una prueba:

```bash
npx playwright show-report
```

---

## 13. Ejecutar con UI de Playwright

Para depurar visualmente desde la interfaz de Playwright:

```bash
npx playwright test --ui
```

---

## 14. Comandos útiles

### Compilar proyecto

```bash
npm run build
```

### Ejecutar test principal visible

```bash
npx playwright test tests/checkout/purchase-with-discount.spec.ts --project=chromium --headed
```

### Ejecutar test principal sin navegador visible

```bash
npx playwright test tests/checkout/purchase-with-discount.spec.ts --project=chromium
```

### Ejecutar smoke de Mailtrap

```bash
npx playwright test tests/mailtrap-smoke.spec.ts --project=chromium
```

### Ver reporte

```bash
npx playwright show-report
```

### Instalar navegadores

```bash
npx playwright install
```

### Instalar navegadores con dependencias en Linux

```bash
npx playwright install --with-deps
```

---

## 15. Estructura del proyecto

```text
.
├── config/
│   ├── environments/
│   ├── scheduler/
│   └── test-data/
├── docs/
├── notifications/
│   └── templates/
├── reports/
├── src/
│   ├── flows/
│   ├── pages/
│   ├── services/
│   ├── types/
│   └── utils/
├── tests/
│   ├── checkout/
│   │   └── purchase-with-discount.spec.ts
│   └── mailtrap-smoke.spec.ts
├── .env.example
├── .gitignore
├── package.json
├── playwright.config.ts
├── README.md
└── tsconfig.json
```

---

## 16. Archivos que no deben subirse

El `.gitignore` debe evitar subir secretos y archivos generados automáticamente:

```gitignore
node_modules/

.env
.env.*
!.env.example

test-results/
playwright-report/
blob-report/
playwright/.cache/

reports/
report/
logs/

screenshots/
videos/
traces/

dist/
build/
coverage/

.idea/
.vscode/

.DS_Store
Thumbs.db

*.log
*.tmp
*.temp
```

Validar que `.env` no esté versionado:

```bash
git ls-files .env
```

Si no muestra nada, está correcto.

Si aparece, sacarlo del seguimiento:

```bash
git rm --cached .env
```

Luego confirmar:

```bash
git status
```

---

## 17. Ejecución recomendada desde cero

Para correr el proyecto en otro computador:

```bash
git clone git@github.com:FabricioAlama2001/prueba-automatizacion-ecommerce-tp.git
cd prueba-automatizacion-ecommerce-tp
npm install
npx playwright install
cp .env.example .env
npm run build
npx playwright test tests/checkout/purchase-with-discount.spec.ts --project=chromium --headed
```

Luego abrir el reporte:

```bash
npx playwright show-report
```

---

## 18. Errores comunes

### Error: No tests found

Validar que el archivo exista:

```bash
ls tests/checkout/
```

Ejecutar directamente:

```bash
npx playwright test tests/checkout/purchase-with-discount.spec.ts --project=chromium --headed
```

---

### Error: Browser not installed

Ejecutar:

```bash
npx playwright install
```

En Linux:

```bash
npx playwright install --with-deps
```

---

### Error de timeout

Puede ocurrir por lentitud del ambiente, red, agenda o pasarela de pago.

Volver a ejecutar:

```bash
npx playwright test tests/checkout/purchase-with-discount.spec.ts --project=chromium --headed
```

Revisar el reporte:

```bash
npx playwright show-report
```

---

### Error en agenda

Si la psicóloga/o no tiene disponibilidad en la fecha configurada, el monitor buscará fechas adicionales según:

```env
SCHEDULE_SEARCH_MAX_DAYS=10
```

Si no encuentra disponibilidad, aumentar temporalmente este valor o ajustar:

```env
SESSION_OFFSET_DAYS=15
```

---

### Error en Mailtrap

Validar variables:

```env
MAILTRAP_HOST=
MAILTRAP_PORT=
MAILTRAP_USERNAME=
MAILTRAP_PASSWORD=
MAILTRAP_FROM=
MAILTRAP_TO=
```

Probar solo Mailtrap:

```bash
npx playwright test tests/mailtrap-smoke.spec.ts --project=chromium
```

---

## 19. Flujo rápido para QA

Configurar `.env`:

```env
APP_ENV=qa
BASE_URL=https://demo.test.tupsicologo.com/
COMPLETE_PAYMENT=true
APPLY_DISCOUNT=true
CAPTURE_TOTAL_PAID=true
REQUIRE_TOTAL_PAID=true
```

Ejecutar:

```bash
npm run build
npx playwright test tests/checkout/purchase-with-discount.spec.ts --project=chromium --headed
```

Ver reporte:

```bash
npx playwright show-report
```

---

## 20. Estado esperado

Si todo funciona correctamente, la terminal debe mostrar:

```text
1 passed
```

Y en Mailtrap debe llegar un correo con asunto similar a:

```text
[ÉXITO] Monitor de comprobación
```

El correo debe incluir, como mínimo:

- Ambiente
- URL base
- ID de ejecución
- Fecha objetivo
- País
- Continente
- Psicóloga/o
- Plan
- Si completó pago
- Si aplicó cupón
- Código del cupón
- Total cobrado
- URL final
- Error, si aplica

---


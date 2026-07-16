# Prodex — Style Guide

Extraído visualmente del dashboard de referencia.

---

## 1. Identidad

| Atributo | Valor |
|---|---|
| Nombre del producto | **Prodex** |
| Tagline implícito | Dashboard de gestión e-commerce / marketplace |
| Tono | Profesional, limpio, data-driven |

---

## 2. Paleta de colores

Paleta centrada en tonos cálidos (naranjas y amarillos) contrastados con grises neutros.

### Colores principales (cálidos)

| Nombre | Hex | Uso |
|---|---|---|
| Primary Dark | `#E75300` | Sidebar activo, botones primarios, acentos clave, sombras en objetos cálidos |
| Primary Orange | `#FF891A` | Botones, links, acentos secundarios |
| Primary Yellow | `#FFAE09` | Alertas, highlights, acentos terciarios |
| Primary Peach | `#FFB876` | Rellenos suaves, gráficos secundarios |
| Primary Beige | `#FFE7D1` | Backgrounds de íconos, estados hover suaves, fondos pastel |

### Colores secundarios (neutros)

| Nombre | Hex | Uso |
|---|---|---|
| Gray Dark | `#414B53` | Títulos, texto principal, sombras en objetos grises |
| Gray Medium | `#888E93` | Labels secundarios, fechas, metadatos |
| Gray Light | `#D0D2D4` | Divisores, bordes de tabla, separadores |
| White | `#FFFFFF` | Cards, sidebar, panel principal |

### Colores de superficie

| Nombre | Hex | Uso |
|---|---|---|
| Background App | `#FFE7D1` | Fondo global de la app |
| Surface White | `#FFFFFF` | Cards, sidebar, panel principal |
| Border Subtle | `#D0D2D4` | Divisores, bordes de tabla, separadores |

### Colores de estado / badge

| Nombre | Hex | Uso |
|---|---|---|
| Success | `#FF891A` | Indicadores positivos (ej. income) |
| Warning | `#FFAE09` | Alertas de stock bajo |
| Danger | `#E75300` | Gastos, tendencias negativas |
| Info | `#FFB876` | Elementos informativos |

### Colores de categorías (Donut chart)

| Categoría | Hex |
|---|---|
| Electronics | `#E75300` (naranja oscuro) |
| Fashion | `#FFAE09` (amarillo anaranjado) |
| Health & Wellness | `#FF891A` (naranja) |
| Home & Living | `#FFB876` (melocotón) |

### Badge / Tag colors

| Badge | Background | Text |
|---|---|---|
| New Order | `#FFE7D1` | `#E75300` |
| Low Stock | `#FFE7D1` | `#E75300` |
| Campaign | `#FFE7D1` | `#FF891A` |
| System | `#D0D2D4` | `#888E93` |

---

## 3. Tipografía

**Familia principal:** `Inter` (sans-serif, sistema UI)

### Escala tipográfica

| Rol | Size | Weight | Color | Uso |
|---|---|---|---|---|
| KPI Value | `28–32px` | `700` | `#414B53` | Métricas grandes (1,525 / $157,342) |
| Section Title | `16px` | `600` | `#414B53` | Títulos de sección (Sales Revenue, Top Products) |
| Body | `14px` | `400` | `#414B53` | Contenido general, filas de tabla |
| Label / Caption | `12px` | `400–500` | `#888E93` | Subtítulos, fechas, metadatos |
| Sidebar Nav | `14px` | `500` | `#414B53` / `#E75300` | Items de navegación |
| Badge | `11–12px` | `500` | Varía por tipo | Tags de estado |

---

## 4. Espaciado y layout

### Grid general

- Layout: **Sidebar fijo + main content**
- Sidebar width: `~260px`
- Main content: `fluid`, con padding interno de `~24–32px`
- Gap entre cards KPI: `16px`
- Gap entre secciones: `24px`

### Cards

- `border-radius`: `12px`
- `padding`: `20–24px`
- `background`: `#FFFFFF`
- `box-shadow`: `0 1px 3px rgba(0,0,0,0.08)`
- Sin border explícito (solo sombra sutil)

### Sidebar

- `background`: `#FFFFFF`
- Ítem activo: `background #FFE7D1`, `color #E75300`, `border-radius 8px`
- Ítem hover: `background #FFE7D1`
- Secciones separadas por label uppercase muted (`MAIN`, `SETTINGS`)

---

## 5. Componentes

### KPI Cards (métricas superiores)

```
┌─────────────────────────┐
│  [ícono]  Label          │
│           Valor grande   │
└─────────────────────────┘
```

- Ícono en contenedor circular con color temático suave
- Label: `12px`, muted
- Valor: `28–32px`, bold, dark

### Gráfico de barras (Sales Revenue)

- Barras: `border-radius-top: 6px`
- Color one-time revenue: `#E75300` (opaco)
- Color recurring revenue: `#FFB876` (claro)
- Eje Y: labels muted, líneas guía `#D0D2D4`
- Tooltip: card blanca con sombra, dot de color + label + valor bold

### Donut chart (Top Categories)

- Centro: label "Total Sales" + valor bold
- Segmentos con gap visual entre ellos (`stroke-gap`)
- Leyenda: dot de color + nombre + valor + porcentaje bold

### Tabla (Top Products)

- Header: `12px`, muted, `font-weight: 500`
- Rows: `14px`, separadas por border `#D0D2D4`
- Columnas numéricas: `text-align: right`
- Imagen de producto: `24x24px`, rounded

### Recent Activity

- Ícono de actividad en contenedor circular con color temático
- Título en bold + nombre en muted
- Badge de tipo alineado a la derecha

### Badges / Tags

- `border-radius: 6px`
- `padding: 4px 10px`
- `font-size: 12px`, `font-weight: 500`
- Sin borde, solo background coloreado

---

## 6. Iconografía

- Estilo: **outline / stroke**, 1.5px, esquinas redondeadas
- Tamaño: `18–20px` en sidebar, `16px` en tablas y actividad
- Librería compatible: `Lucide Icons` o `Heroicons`

---

## 7. Interacción y estados

| Estado | Tratamiento |
|---|---|
| Hover (nav) | Background `#FFE7D1` |
| Activo (nav) | Background `#FFE7D1`, texto `#E75300` |
| Hover (botón primario) | Darken `#E75300` |
| Focus | Outline `2px solid #FF891A`, offset `2px` |
| Toggle (dark mode) | Switch pill, off = `#D0D2D4` |

---

## 8. Upgrade / CTA Banner

- Background: `#414B53` (dark)
- Texto: blanco
- Badge "Premium": `background #E75300`, `color white`, `border-radius: 4px`
- Botón "Upgrade Now": `background white`, `color #414B53`, `font-weight: 600`
- Ícono decorativo de escudo en naranja

---

## 9. Variables CSS (token system)

```css
:root {
  /* Colors */
  --color-primary:        #E75300;
  --color-primary-light:  #FFE7D1;
  --color-primary-muted:  #FFB876;

  --color-text-dark:      #414B53;
  --color-text-body:      #414B53;
  --color-text-muted:     #888E93;

  --color-bg-app:         #FFE7D1;
  --color-bg-surface:     #FFFFFF;
  --color-border:         #D0D2D4;

  --color-success:        #FF891A;
  --color-warning:        #FFAE09;
  --color-danger:         #E75300;

  /* Typography */
  --font-family:          'Inter', system-ui, sans-serif;
  --font-size-xs:         11px;
  --font-size-sm:         12px;
  --font-size-base:       14px;
  --font-size-md:         16px;
  --font-size-xl:         28px;

  /* Spacing */
  --spacing-xs:           4px;
  --spacing-sm:           8px;
  --spacing-md:           16px;
  --spacing-lg:           24px;
  --spacing-xl:           32px;

  /* Radius */
  --radius-sm:            6px;
  --radius-md:            8px;
  --radius-lg:            12px;
  --radius-full:          9999px;

  /* Shadow */
  --shadow-card:          0 1px 3px rgba(0,0,0,0.08);
  --shadow-tooltip:       0 4px 16px rgba(0,0,0,0.12);
}
```
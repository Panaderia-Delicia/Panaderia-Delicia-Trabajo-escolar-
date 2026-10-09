'use strict';
/* ================= DATOS ================= */
/* img: ruta de la foto (ej. 'imagenes/croissant.jpg'). Si queda vacío se muestra el emoji.
   desc: descripción que aparece bajo cada cuadro. */
const productos = [
     {id:1, nombre:'Croissant de mantequilla', cat:'pan',    precio:1.50, emoji:'🥐', color:'--mantequilla', img:'imagenes/cruasan.jpg',       pos:'center',     desc:'Hojaldre dorado y crujiente por fuera, suave y mantecoso por dentro.'},
     {id:2, nombre:'Pan de masa madre',        cat:'pan',    precio:4.25, emoji:'🍞', color:'--durazno',     img:'imagenes/panMasaMadre.jpg',  pos:'40% center', desc:'Corteza crujiente y miga suave y aireada, ideal con un poco de mantequilla.'},
     {id:3, nombre:'Baguette artesanal',       cat:'pan',    precio:2.00, emoji:'🥖', color:'--mantequilla', img:'imagenes/baguet.jpg',        pos:'90% center', desc:'Corteza fina y crocante con miga ligera, perfecta para sándwiches.'},
     {id:4, nombre:'Rollo de canela',          cat:'pan',    precio:2.25, emoji:'🌀', color:'--rosa',        img:'imagenes/canelaRol.jpg',     pos:'center',     desc:'Masa suave en espiral con canela, cubierta de glaseado cremoso de vainilla.'},
     {id:5, nombre:'Pastel de fresas',         cat:'postre', precio:3.75, emoji:'🍰', color:'--rosa',        img:'imagenes/pastelFresa.jpg',   pos:'40% center', desc:'Bizcocho esponjoso con crema ligera y fresas frescas.'},
     {id:6, nombre:'Cupcake de vainilla',      cat:'postre', precio:1.75, emoji:'🧁', color:'--lila',        img:'imagenes/cupkakeVanilla.jpg',pos:'55% center', desc:'Bizcocho tierno de vainilla con betún cremoso y confeti de colores.'},
     {id:7, nombre:'Dona glaseada',            cat:'postre', precio:1.25, emoji:'🍩', color:'--menta',       img:'imagenes/Dona.jpg',          pos:'center',     desc:'Suave y esponjosa, bañada en un dulce glaseado brillante.'},
     {id:8, nombre:'Galletas de chispas',      cat:'postre', precio:0.90, emoji:'🍪', color:'--durazno',     img:'imagenes/galleta.jpg',       pos:'40% center', desc:'Crujientes por fuera, suaves por dentro y llenas de chocolate.'}
 ];
const sucursales = [
  {nombre:'Delicia Altavista',   dir:'Unicentro Altavista, Autopista de Oro',     horario:'Lun a Sáb 9:00 a 20:00', lat:13.6989, lng:-89.1914},
  {nombre:'Delicia San Martin',  dir:'El Encuentro San Martin',       horario:'Lun a Dom 8:00 a 21:00', lat:13.7006, lng:-89.2383},
  {nombre:'Delicia Apopa', dir:'El Encuentro Valle Dulce',       horario:'Lun a Sáb 7:30 a 19:30', lat:13.6769, lng:-89.2797}
];

/* ================= UTILIDADES ================= */
const $ = id => document.getElementById(id);
const dinero = n => '$' + n.toFixed(2);
const visual = p => p.img ? `<img src="${p.img}" alt="${p.nombre}" style="object-position:${p.pos || 'center'}" loading="lazy" decoding="async">` : p.emoji;
const pedido = {};   // { idProducto: cantidad }

/* ================= NAVEGACIÓN ENTRE APARTADOS ================= */
const tabs = document.querySelectorAll('nav button[data-ir]');
const secciones = [...document.querySelectorAll('main section')];

function ir(id){
  if(!secciones.some(s => s.id === id)) id = 'productos';
  secciones.forEach(s => s.classList.toggle('activa', s.id === id));
  tabs.forEach(t => t.dataset.ir === id ? t.setAttribute('aria-current','page') : t.removeAttribute('aria-current'));
  window.scrollTo({top:0, behavior:'instant'});
}
tabs.forEach(t => t.addEventListener('click', () => { location.hash = t.dataset.ir; }));
window.addEventListener('hashchange', () => ir(location.hash.slice(1)));   // funciona con el botón "atrás"
ir(location.hash.slice(1));
/* Botón "Información de contacto": baja hasta el pie de página */
$('btn-contacto').addEventListener('click', () => {
  $('contacto').scrollIntoView();
});

/* ================= PRODUCTOS (catalogo) ================= */
function pintarVitrina(cat = 'todos'){
  $('rejilla').innerHTML = productos.filter(p => cat === 'todos' || p.cat === cat).map(p => `
    <article class="producto">
      <div class="cuadro" style="background:var(${p.color})">${visual(p)}</div>
      <h3>${p.nombre}</h3>
      <p>${p.desc}</p>
    </article>`).join('');
}
document.querySelector('.filtros').addEventListener('click', e => {
  const b = e.target.closest('button'); if(!b) return;
  document.querySelectorAll('.filtros button').forEach(x => x.setAttribute('aria-pressed', x === b));
  pintarVitrina(b.dataset.cat);
});

/* ================= PEDIDOS ================= */
function pintarLista(){   // se dibuja una sola vez; luego solo se actualizan las cantidades
  $('lista').innerHTML = productos.map(p => `
    <div class="item">
      <div class="mini" style="background:var(${p.color})">${visual(p)}</div>
      <div class="nombre">${p.nombre}<small>${dinero(p.precio)}</small></div>
      <div class="contador-qty">
        <button type="button" data-id="${p.id}" data-d="-1" aria-label="Quitar uno de ${p.nombre}">−</button>
        <output id="q${p.id}" aria-label="Cantidad de ${p.nombre}">0</output>
        <button type="button" data-id="${p.id}" data-d="1" aria-label="Agregar uno de ${p.nombre}">+</button>
      </div>
    </div>`).join('');
}
$('lista').addEventListener('click', e => {
  const b = e.target.closest('button[data-id]'); if(!b) return;
  const id = +b.dataset.id, n = Math.max(0, (pedido[id] || 0) + +b.dataset.d);
  n ? pedido[id] = n : delete pedido[id];
  $('q' + id).textContent = n;
  actualizarResumen();
});
function actualizarResumen(){
  const sel = productos.filter(p => pedido[p.id]);
  $('lineas').innerHTML = sel.length
    ? sel.map(p => `<li><span>${pedido[p.id]} × ${p.nombre}</span><span>${dinero(p.precio * pedido[p.id])}</span></li>`).join('')
    : '<li class="vacio">Aún no has elegido nada.</li>';
  $('total').textContent = dinero(sel.reduce((t,p) => t + p.precio * pedido[p.id], 0));
  $('contador').textContent = sel.reduce((n,p) => n + pedido[p.id], 0);
}
$('sucursal').innerHTML = sucursales.map(s => `<option>${s.nombre}</option>`).join('');

// No permitir fechas de retiro en el pasado
const ahora = new Date(Date.now() - new Date().getTimezoneOffset() * 60000);
$('fecha').min = ahora.toISOString().slice(0, 16);

/* CONEXIÓN CON HOJAS DE CÁLCULO */
const URL_PEDIDOS = 'https://script.google.com/macros/s/AKfycbzYyP-WejwMh4mfHKYgnqjuSnvuEfernQEJdlZSLxDIlJN80RipdSSeU6K_PMXdFP-4/exec';

async function enviarPedido(datos){
  // Sin cabeceras personalizadas: así el navegador no bloquea la petición (CORS)
  const res = await fetch(URL_PEDIDOS, { method: 'POST', body: JSON.stringify(datos) });
  const r = await res.json();
  if(!r.ok) throw new Error(r.error || 'No se pudo guardar el pedido');
  return r.id;   // número de pedido, por ejemplo "P-0001"
}

$('form').addEventListener('submit', async e => {
  e.preventDefault();               // el navegador ya validó los campos obligatorios
  const form = e.target, m = $('mensaje'), btn = form.querySelector('[type=submit]');
  const sel = productos.filter(p => pedido[p.id]);
  m.hidden = false;
  if(!sel.length){ m.className = 'mensaje error'; m.textContent = 'Agrega al menos un producto para enviar tu pedido.'; return; }
  const datos = {
    ...Object.fromEntries(new FormData(form)),
    productos: sel.map(p => `${pedido[p.id]} x ${p.nombre}`).join(', '),
    total: sel.reduce((t,p) => t + p.precio * pedido[p.id], 0).toFixed(2)
  };
  datos.nombre = datos.nombre.trim();
  btn.disabled = true;
  let id;
  try { id = await enviarPedido(datos); }
  catch { m.className = 'mensaje error'; m.textContent = 'No pudimos enviar tu pedido. Inténtalo de nuevo.'; return; }
  finally { btn.disabled = false; }
  m.className = 'mensaje';
  m.textContent = `¡Gracias, ${datos.nombre}! Tu pedido estará listo en ${datos.sucursal}.${id ? ` Número de pedido: ${id}.` : ''}`;
  Object.keys(pedido).forEach(k => { delete pedido[k]; $('q' + k).textContent = 0; });
  actualizarResumen(); form.reset();
});

/* ================= SUCURSALES ================= */
$('sedes').innerHTML = sucursales.map((s,i) => `
  <button type="button" class="sede" data-i="${i}" aria-pressed="false">
    <strong>${s.nombre}</strong><span>${s.dir}</span><span>${s.horario}</span>
  </button>`).join('');
$('sedes').addEventListener('click', e => {
  const b = e.target.closest('.sede'); if(!b) return;
  document.querySelectorAll('.sede').forEach(x => { x.classList.toggle('activa', x === b); x.setAttribute('aria-pressed', x === b); });
  /* Cuando conectes el mapa, centra aquí en sucursales[+b.dataset.i] (usa .lat y .lng) */
});

/* ================= PIE DE PÁGINA: UBICACIONES DE SUCURSALES ================= */
/* Lee el arreglo "sucursales" y dibuja cada sede con su dirección.
   La dirección enlaza a Google Maps usando lat y lng. */
$('pie-sedes').innerHTML = sucursales.map(s => `
  <li class="pie-info__fila">
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex:none"><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>
    <div>
      <strong>${s.nombre}</strong>
      <a href="https://www.google.com/maps?q=${s.lat},${s.lng}" target="_blank" rel="noopener">${s.dir}</a>
    </div>
  </li>`).join('');

/* ================= INICIO ================= */
pintarVitrina();
pintarLista();
actualizarResumen();

/* ================= MENÚ DE MANUALES (hamburguesa) ================= */
const burger = $('burger'), menuManuales = $('menu-manuales');
function cerrarMenu(){
  menuManuales.hidden = true;
  burger.setAttribute('aria-expanded', 'false');
  burger.setAttribute('aria-label', 'Abrir menú de manuales');
}
burger.addEventListener('click', () => {
  const abrir = menuManuales.hidden;
  menuManuales.hidden = !abrir;
  burger.setAttribute('aria-expanded', abrir);
  burger.setAttribute('aria-label', abrir ? 'Cerrar menú de manuales' : 'Abrir menú de manuales');
});
menuManuales.addEventListener('click', e => { if(e.target.closest('a')) cerrarMenu(); });
document.addEventListener('click', e => { if(!e.target.closest('.menu-manuales')) cerrarMenu(); });
document.addEventListener('keydown', e => { if(e.key === 'Escape' && !menuManuales.hidden){ cerrarMenu(); burger.focus(); } });

/* ================= DESARROLLO WEB ================= */
(() => {
  if(!$('desarrollo')) return;   // dentro de la vista previa esta sección no existe
  const btnDev = document.querySelector('.btn-dev'), visor = $('dev-visor'), pre = $('dev-pre');
  const rutas = { html:'index.html', css:'css/index.css', js:'js/index.js' };
  const notas = {
    html:'Solo HTML: la estructura y el contenido de la página, sin estilos ni interactividad. Los productos no aparecen porque se crean con JavaScript.',
    css:'HTML + CSS: ya con colores, tipografías, formas y distribución. Se ve solo la sección Productos, todavía sin productos ni botones que funcionen.',
    js:'HTML + CSS + JS: la página completa. Los productos se generan, los botones navegan y el pedido funciona.'
  };
  const fuentes = {};
  let modo = 'pagina', capa = 'html', archivo = 'html', listo = false, descarga = null;

  function cargar(){   // descarga los 3 archivos de la propia página (una sola vez)
    descarga = descarga || Promise.all(Object.entries(rutas).map(async ([k, ruta]) => {
      const r = await fetch(ruta); if(!r.ok) throw new Error(ruta);
      fuentes[k] = await r.text();
    })).catch(e => { descarga = null; throw e; });
    return descarga;
  }
  function armarPagina(c){   // construye la página con 1, 2 o 3 capas
    const doc = new DOMParser().parseFromString(fuentes.html, 'text/html');
    doc.getElementById('desarrollo')?.remove();
    doc.querySelector('.btn-dev')?.remove();
    doc.querySelectorAll('script').forEach(s => s.remove());
    if(c === 'html'){
      doc.querySelectorAll('link[rel="stylesheet"]').forEach(l => l.remove());
      doc.querySelectorAll('[style]').forEach(el => el.removeAttribute('style'));
    } else {
      const st = doc.createElement('style'); st.textContent = fuentes.css;
      doc.querySelector('link[href="css/index.css"]').replaceWith(st);
    }
    if(c === 'js'){ const sc = doc.createElement('script'); sc.textContent = fuentes.js; doc.body.append(sc); }
    return '<!DOCTYPE html>' + doc.documentElement.outerHTML;
  }
  const esc = t => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');

  async function mostrar(){
    $('dev-pagina').hidden = modo !== 'pagina';
    $('dev-codigo').hidden = modo !== 'codigo';
    try { await cargar(); }
    catch {
      $('dev-nota').textContent = $('dev-info').textContent = 'No se pudieron leer los archivos. Esta función necesita abrir la página desde internet (GitHub Pages) o con un servidor local como Live Server; no funciona abriendo index.html directamente.';
      return;
    }
    if(modo === 'pagina'){
      $('dev-nota').textContent = notas[capa];
      visor.srcdoc = armarPagina(capa);
    } else {
      const lineas = fuentes[archivo].replace(/\s+$/, '').split(/\r?\n/);
      $('dev-info').textContent = `${rutas[archivo]} · ${lineas.length} líneas`;
      pre.innerHTML = lineas.map(l => `<span class="l">${esc(l)}</span>`).join('');
      pre.scrollTop = 0;
    }
  }
  $('desarrollo').addEventListener('click', e => {
    const b = e.target.closest('button'); if(!b) return;
    if(b.dataset.modo) modo = b.dataset.modo;
    else if(b.dataset.capa) capa = b.dataset.capa;
    else if(b.dataset.archivo) archivo = b.dataset.archivo;
    else return;
    b.parentElement.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b));
    mostrar();
  });
    btnDev.addEventListener('click', () => { location.hash = location.hash === '#desarrollo' ? 'productos' : 'desarrollo'; });
  function alEntrar(){
    const activo = location.hash === '#desarrollo';
    activo ? btnDev.setAttribute('aria-current', 'page') : btnDev.removeAttribute('aria-current');
            const texto = activo ? 'Salir de Desarrollo Web y volver a Productos' : 'Desarrollo Web';
       btnDev.title = texto; btnDev.setAttribute('aria-label', texto);
    if(activo && !listo){ listo = true; mostrar(); }
  }
  window.addEventListener('hashchange', alEntrar);
  alEntrar();
})();

/* ================= MISIÓN Y VISIÓN ================= */
const dlgMision = $('dialogo-mision');
$('abrir-mision').addEventListener('click', () => { cerrarMenu(); dlgMision.showModal(); });
$('cerrar-mision').addEventListener('click', () => dlgMision.close());
dlgMision.addEventListener('click', e => { if(e.target === dlgMision) dlgMision.close(); });   // clic en el fondo

'use strict';
/* ================= DATOS (edita precios, nombres y sucursales) ================= */
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
const tabs = document.querySelectorAll('nav button');
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

/* ================= PRODUCTOS (vitrina) ================= */
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

/* CONEXIÓN CON HOJAS DE CÁLCULO
   Pega aquí la URL de tu implementación de Apps Script (termina en /exec). */
const URL_PEDIDOS = 'https://script.google.com/macros/s/AKfycbzYyP-WejwMh4mfHKYgnqjuSnvuEfernQEJdlZSLxDIlJN80RipdSSeU6K_PMXdFP-4/exec';

async function enviarPedido(datos){
  if(!URL_PEDIDOS) throw new Error('Falta configurar URL_PEDIDOS en js/index.js');
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

/* ================= INICIO ================= */
pintarVitrina();
pintarLista();
actualizarResumen();



(function () {

  var SCRIPT_URL = 'https://script.google.com/a/macros/interfunerarias.es/s/AKfycby56H7k_UrzkGRsw0dF3Y3Yp3dlaMsqr6TBTMUX9i2LdetsPR4yqeUkDzYId-nmYhKL/exec';

  // ── Estilos ──────────────────────────────────────────────────────────────
  var style = document.createElement('style');
  style.textContent = [
    '* { box-sizing: border-box; margin: 0; padding: 0; }',
    'body { font-family: "Google Sans", Arial, sans-serif; font-size: 13px; background: #fff; }',
    '.tbl { width: 100%; border-collapse: collapse; }',
    '.tbl thead th {',
    '  padding: 7px 12px; text-align: left; font-size: 11px; font-weight: 500;',
    '  letter-spacing: .05em; color: #5f6368; background: #f8f9fa;',
    '  border-bottom: 1px solid #e0e0e0;',
    '}',
    '.tbl tbody tr { border-bottom: 1px solid #f0f0f0; transition: background .12s; }',
    '.tbl tbody tr:hover td { background: #f8f9fa; }',
    '.tbl td { padding: 10px 12px; vertical-align: top; }',
    /* Badge tipo documento */
    '.badge { display:inline-block; font-size:11px; font-weight:600; padding:2px 9px; border-radius:20px; }',
    '.badge-fac { background:#e6f4ea; color:#137333; }',
    '.badge-abo { background:#fce8d2; color:#a85400; }',
    /* Columna 1: factura + cliente */
    '.fra-num { font-weight:600; font-size:14px; color:#202124; display:flex; align-items:center; gap:6px; flex-wrap:wrap; }',
    '.fra-sub { font-size:12px; color:#5f6368; margin-top:4px; line-height:1.6; }',
    '.fra-sub span { color:#202124; }',
    /* Columna 2: fallecido + servicio */
    '.srv-name { font-weight:500; color:#202124; }',
    '.srv-sub  { font-size:12px; color:#5f6368; margin-top:3px; line-height:1.6; }',
    /* Columna 3: importes + fechas */
    '.imp-tot  { font-weight:600; font-size:15px; text-align:right; color:#202124; }',
    '.imp-neg  { color:#c5221f; }',
    '.imp-det  { font-size:11px; color:#5f6368; text-align:right; margin-top:3px; line-height:1.6; }',
    '.imp-pend { font-size:12px; text-align:right; margin-top:4px; color:#c5221f; font-weight:600; }',
    '.fecha-row { font-size:12px; color:#5f6368; text-align:right; margin-top:3px; line-height:1.6; }',
    '.fecha-row span { color:#202124; }',
    /* Botón comentarios */
    '.btn-com {',
    '  width:28px; height:28px; border-radius:6px;',
    '  background:#1a73e8; border:none; cursor:pointer;',
    '  display:flex; align-items:center; justify-content:center;',
    '  transition: background .15s;',
    '}',
    '.btn-com:hover { background:#1557b0; }',
  ].join('\n');
  document.head.appendChild(style);

  // ── Helpers ───────────────────────────────────────────────────────────────
  function val(row, headers, id) {
    var idx = headers.findIndex(function (h) { return h.id === id; });
    if (idx < 0) return '';
    var v = row[idx];
    return (v === null || v === undefined) ? '' : v;
  }

  function fmt(num) {
    var n = parseFloat(num) || 0;
    return n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function dash(v) {
    return (v === '' || v === null || v === undefined) ? '—' : v;
  }

  function iconComment() {
    return '<svg width="14" height="14" viewBox="0 0 24 24" fill="white">' +
      '<path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>' +
      '</svg>';
  }

  // ── Render principal ──────────────────────────────────────────────────────
  function drawViz(data) {
    document.body.innerHTML = '';

    var rows    = data.tables.DEFAULT.rows;
    var headers = data.tables.DEFAULT.headers;

    var table = document.createElement('table');
    table.className = 'tbl';

    // Cabecera
    var thead = table.createTHead();
    var hrow  = thead.insertRow();
    [['', '3%'], ['Factura · Cliente', '27%'], ['Fallecido · Servicio', '41%'], ['Importes · Fechas', '29%']]
      .forEach(function (col) {
        var th = document.createElement('th');
        th.textContent  = col[0];
        th.style.width  = col[1];
        hrow.appendChild(th);
      });

    // Cuerpo
    var tbody = table.createTBody();
    rows.forEach(function (row) {
      var nfra      = String(val(row, headers, 'nfra'));
      var tipodoc   = String(val(row, headers, 'tipo_documento')).toUpperCase();
      var cliente   = dash(val(row, headers, 'cliente'));
      var ffra      = dash(val(row, headers, 'ffra'));
      var siniestro = dash(val(row, headers, 'siniestro'));
      var fallecido = dash(val(row, headers, 'fallecido'));
      var tanatorio = dash(val(row, headers, 'tanatorio'));
      var destino   = dash(val(row, headers, 'destino'));
      var idexp     = dash(val(row, headers, 'idexp'));
      var fsalida   = dash(val(row, headers, 'fsalida'));
      var fenv      = dash(val(row, headers, 'fenv'));
      var fvenc     = dash(val(row, headers, 'fvenc'));
      var base      = parseFloat(val(row, headers, 'base'))      || 0;
      var suplidos  = parseFloat(val(row, headers, 'suplidos'))  || 0;
      var totfra    = parseFloat(val(row, headers, 'totfra'))    || 0;
      var pendiente = parseFloat(val(row, headers, 'pendiente')) || 0;

      var esAbono   = tipodoc === 'ABONO';
      var badgeClass = esAbono ? 'badge badge-abo' : 'badge badge-fac';
      var badgeLabel = esAbono ? 'ABO' : 'FAC';
      var impClass   = totfra < 0 ? 'imp-tot imp-neg' : 'imp-tot';

      var tr = tbody.insertRow();

      // Celda 0: botón comentarios
      var td0 = tr.insertCell();
      var btn = document.createElement('button');
      btn.className = 'btn-com';
      btn.title     = 'Comentarios ' + nfra;
      btn.innerHTML = iconComment();
      btn.addEventListener('click', function () {
        window.open(SCRIPT_URL + '?f=' + encodeURIComponent(nfra), '_blank');
      });
      td0.appendChild(btn);

      // Celda 1: factura + cliente
      var td1 = tr.insertCell();
      td1.innerHTML =
        '<div class="fra-num">' + nfra + ' <span class="' + badgeClass + '">' + badgeLabel + '</span></div>' +
        '<div class="fra-sub">' +
          cliente + '<br>' +
          'F Fra: <span>' + ffra + '</span> · Siniestro: <span>' + siniestro + '</span>' +
        '</div>';

      // Celda 2: fallecido + servicio
      var td2 = tr.insertCell();
      td2.innerHTML =
        '<div class="srv-name">' + fallecido + '</div>' +
        '<div class="srv-sub">' +
          tanatorio + '<br>' +
          destino + '<br>' +
          'Exp: ' + idexp + ' · F Salida: ' + fsalida +
        '</div>';

      // Celda 3: importes + fechas
      var td3 = tr.insertCell();
      td3.innerHTML =
        '<div class="' + impClass + '">' + fmt(totfra) + ' €</div>' +
        '<div class="imp-det">Base: ' + fmt(base) + ' · Suplidos: ' + fmt(suplidos) + '</div>' +
        (pendiente !== 0 ? '<div class="imp-pend">Pendiente: ' + fmt(pendiente) + ' €</div>' : '') +
        '<div class="fecha-row">' +
          'Env: <span>' + fenv + '</span><br>' +
          'Venc: <span>' + fvenc + '</span>' +
        '</div>';
    });

    document.body.appendChild(table);
  }

  dscc.subscribeToData(drawViz, { transform: dscc.objectTransform });

})();

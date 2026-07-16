import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class TerminalSummaryAdapter {

    // public transform(data: any, context: any): any[] {
    //     let listado: any[] = [];
    //     if (data.listado) {
    //         if (Array.isArray(data.listado)) {
    //             listado = data.listado;
    //         } else if (typeof data.listado === 'object') {
    //             // Aplanamos las llaves si viene como objeto
    //             listado = Object.values(data.listado).flat();
    //         }
    //     }

    //     console.log("✅ Listado plano de barcos:", listado);

    //     // B. DEBUG: Si terminalesFiltradas está vacío, aquí está el problema

    //     // 1. NORMALIZACIÓN DEL PUERTO (Parche para Santa Marta)
    //     let puertoActual = (context.puerto || 'BUENAVENTURA').trim().toUpperCase();
    //     if (puertoActual === 'SANTAMARTA') {
    //         puertoActual = 'SANTA_MARTA';
    //     }

    //     // 2. EXTRACCIÓN DIRECTA DESDE LA INFRAESTRUCTURA DEL MAPA
    //     const datosDelPuerto = listado[puertoActual] || {};
    //     const infraestructuraPuerto = datosDelPuerto.infraestructura || {};

    //     // Extraemos solo las llaves válidas (ej. SPRBUN, TCBUEN, SPSM)
    //     let terminalesFiltradas = Object.keys(infraestructuraPuerto).filter(key =>
    //         key !== 'OTRAS / POR DEFINIR'
    //     );

    //     console.log("🔍 Terminales a procesar:", terminalesFiltradas);
    //     // Función auxiliar para formatear miles (ej: 14200 -> 14.2k)
    //     const formatearMiles = (valor: number) => {
    //         if (valor >= 1000) {
    //             return (valor / 1000).toFixed(1) + 'k';
    //         }
    //         return valor.toString();
    //     };

    //     // 3. ARMADO VISUAL Y PROCESAMIENTO
    //     return terminalesFiltradas.map((nombreTerm: string) => {
    //         console.log("Procesando terminal:", nombreTerm);
    //         // --- A. FILTRO DE BARCOS (Más tolerante a acrónimos) ---
    //         // const navesEnTerminal = listado.filter((nave: any) => {
    //         //     const termNave = (nave.terminal || '').trim().toUpperCase();

    //         //     if (termNave === '') return false;

    //         //     // Comparamos de forma cruzada para atrapar acrónimos
    //         //     return termNave === nombreTerm ||
    //         //         nombreTerm.includes(termNave) ||
    //         //         termNave.includes(nombreTerm) ||
    //         //         // Excepción común: si el terminal es TCBUEN y el barco dice TCB o TBC
    //         //         (nombreTerm === 'TCBUEN' && (termNave === 'TCB' || termNave === 'TBC'));
    //         // });

    //         const navesEnTerminal = listado.filter((nave: any) => {
    //             // 1. Limpiamos la terminal del barco (lo que viene de la BD)
    //             const termNave = (nave.terminal || '').toString().trim().toUpperCase().replace(/[\s\-_]/g, '');

    //             // 2. Limpiamos el ID de la terminal que estamos iterando (nombreTerm)
    //             const termUI = nombreTerm.toString().trim().toUpperCase().replace(/[\s\-_]/g, '');

    //             // 🚨 DEBUG: Si esto imprime muchos "MATCH" para terminales distintas, ya sabemos por qué
    //             console.log(`Comparando: BD[${termNave}] vs UI[${termUI}] -> ${termNave === termUI}`);

    //             return termNave === termUI;
    //         });

    //         const toneladasTotales = navesEnTerminal.reduce((acc: number, nave: any) => {
    //             // parseFloat extrae el número inicial aunque venga acompañado de texto (ej. "33859.54 DES")
    //             let tm = parseFloat(nave.trabajoOperacion || nave.toneladas || nave.cantidadMovida || 0);
    //             return acc + (isNaN(tm) ? 0 : tm);
    //         }, 0);

    //         // --- C. METADATA DEL MAPA PORTUARIO ---
    //         const infoTerminalMapa = infraestructuraPuerto[nombreTerm] || {};
    //         const descripcionMapa = infoTerminalMapa.descripcion || 'DESCRIPCIÓN DEL TERMINAL';
    //         const leyendaMapa = infoTerminalMapa.leyenda || infoTerminalMapa.legend || '';
    //         const esCongestionado = infoTerminalMapa.estado === 'CONGESTIONADO';
    //         const tipoCarga = (infoTerminalMapa.tipoCarga || '').toUpperCase();

    //         // const muellesEstructurados = muellesCrudos.map((m: any) => {

    //         //     // Normalizamos el ID del muelle (Ej: "M-1")
    //         //     const idMuelle = m.label || m.nombre || m.id || m.muelle || (typeof m === 'string' ? m : 'Muelle');

    //         //     const mapaAtraque = context.mapaAtraque || {}; // Este mapa debe decir: { "LOWLANDS BLOSSOM": "M-9" }
    //         //     const idCrudo = (m.id || m.label || m.nombre || '').toString().trim().toUpperCase();
    //         //     // const barcoEnMuelle = navesEnTerminal.find((nave: any) => {
    //         //     //     // Buscamos el muelle asignado a este barco específico en el mapa que nos pasó el padre
    //         //     //     const muelleAsignado = mapaAtraque[nave.motonave];
    //         //     //     const idMuelle = (m.id || '').toString().trim().toUpperCase();

    //         //     //     return muelleAsignado === idMuelle;
    //         //     // });
    //         //     const barcoEnMuelle = navesEnTerminal.find((nave: any) => {
    //         //         const muelleExcel = (nave.muelle || nave.pier || '').toString().trim().toUpperCase();
    //         //         const muelleUI = idCrudo.trim().toUpperCase();

    //         //         // Si viene nulo, vacío o es un "To Be Confirmed", no se asigna a posiciones físicas de cemento
    //         //         if (!muelleExcel || ['TBC', 'TBA', 'PENDING', 'NULL'].includes(muelleExcel)) {
    //         //             return false;
    //         //         }

    //         //         // Normalización matemática: Removemos espacios y guiones ("M-1" -> "M1", "M - 1" -> "M1")
    //         //         const cleanExcel = muelleExcel.replace(/[\s\-]/g, '');
    //         //         const cleanUI = muelleUI.replace(/[\s\-]/g, '');

    //         //         // Match absoluto y exacto de extremo a extremo
    //         //         return cleanExcel === cleanUI;
    //         //     });

    //         //     const estaOcupado = barcoEnMuelle ? true : (m.estado === 'ocupado' || m.estado === 'OCUPADO');
    //         //     console.log('=======barco en muelle', barcoEnMuelle);

    //         //     // Retornamos TODAS las variables para que el HTML no falle
    //         //     return {
    //         //         ...m,
    //         //         label: idMuelle,
    //         //         class: estaOcupado ? 'dock-ocupado' : 'dock-libre',

    //         //         // Variables específicas para la tabla
    //         //         id: idMuelle,
    //         //         especialidad: m.especialidad || m.esp || 'General',
    //         //         calado: m.calado || m.draft || '-',
    //         //         barcoAtracado: barcoEnMuelle ? barcoEnMuelle.motonave : null, // Si no hay barco, mandamos null
    //         //         operacionBarco: barcoEnMuelle ? barcoEnMuelle.trabajoOperacion : null,
    //         //         estado: estaOcupado ? 'ocupado' : 'libre'
    //         //     };
    //         // });

    //         // --- E. RETORNO FINAL PARA LA UI ---
    //         // const muellesEstructurados = muellesCrudos.map((m: any) => {
    //         //     // 1. Identificación única y limpia
    //         //     console.log('📦 LISTADO TOTAL DE BARCOS RECIBIDO:', listado.length);
    //         //     console.log('🔑 TERMINALES ÚNICAS DETECTADAS:', [...new Set(listado.map((n: { terminal: any; }) => n.terminal))]);

    //         //     const idMuelle = (m.id || m.label || m.nombre || m.muelle || 'Muelle').toString().trim();

    //         //     // 2. Búsqueda estricta (ya la tienes, está bien)
    //         //     const barcoEnMuelle = navesEnTerminal.find((nave: any) => {
    //         //         const muelleExcel = (nave.muelle || nave.pier || '').toString().trim().toUpperCase().replace(/[\s\-]/g, '');
    //         //         const muelleUI = idMuelle.trim().toUpperCase().replace(/[\s\-]/g, '');

    //         //         if (!muelleExcel || ['TBC', 'TBA', 'PENDING', 'NULL'].includes(muelleExcel)) return false;
    //         //         return muelleExcel === muelleUI;
    //         //     });

    //         //     const estaOcupado = !!barcoEnMuelle;

    //         //     console.log('barcoMuelle', barcoEnMuelle);

    //         //     // 3. RETORNO ESTRICTO (Garantiza que las columnas no se desplacen)
    //         //     return {
    //         //         id: idMuelle,                  // Muelle
    //         //         label: idMuelle,
    //         //         especialidad: m.especialidad || m.esp || 'General',
    //         //         calado: m.calado || m.draft || '-',
    //         //         barcoAtracado: barcoEnMuelle ? barcoEnMuelle.motonave : null, // Si es null, el HTML pone "—"
    //         //         operacionBarco: barcoEnMuelle ? barcoEnMuelle.trabajoOperacion : 'Disponible', // El HTML usará el 'Disponible' si es null
    //         //         estado: estaOcupado ? 'ocupado' : 'libre',
    //         //         class: estaOcupado ? 'dock-ocupado' : 'dock-libre'
    //         //     };
    //         // });
    //         const muellesCrudos = infoTerminalMapa.muelles || infoTerminalMapa.docks || [];

    //         const muellesEstructurados = muellesCrudos.map((m: any) => {
    //             const idMuelle = (m.id || m.label || m.nombre || m.muelle || 'Muelle').toString().trim();

    //             // Filtramos el barco correspondiente para este muelle ESPECÍFICO
    //             const barcoEnMuelle = navesEnTerminal.find((nave: any) => {
    //                 const muelleExcel = (nave.muelle || nave.pier || '').toString().trim().toUpperCase().replace(/[\s\-]/g, '');
    //                 const muelleUI = idMuelle.trim().toUpperCase().replace(/[\s\-]/g, '');
    //                 return muelleExcel === muelleUI;
    //             });

    //             return {
    //                 id: idMuelle,
    //                 label: idMuelle,
    //                 especialidad: m.especialidad || m.esp || 'General',
    //                 calado: m.calado || m.draft || '-',
    //                 barcoAtracado: barcoEnMuelle ? barcoEnMuelle.motonave : null,
    //                 operacionBarco: barcoEnMuelle ? barcoEnMuelle.trabajoOperacion : 'Disponible',
    //                 estado: barcoEnMuelle ? 'ocupado' : 'libre',
    //                 class: barcoEnMuelle ? 'dock-ocupado' : 'dock-libre'
    //             };
    //         });

    //         return {
    //             nombreTerminal: nombreTerm,
    //             nombre: infoTerminalMapa.nombre || nombreTerm,
    //             descripcion: descripcionMapa,
    //             legend: leyendaMapa,
    //             docks: muellesEstructurados,  // Array para pintar los cuadritos arriba
    //             tableData: muellesEstructurados, // ✅ Array para pintar las filas de la tabla
    //             operativo: !esCongestionado,  // Para que la tabla se llene al expandir
    //             status: esCongestionado ? 'warning' : 'success',

    //             // Bloque de KPIs
    //             kpis: {
    //                 ocupacion: infoTerminalMapa.ocupacion || '50%', // Placeholder, ideal si viene del backend
    //                 motonaves: navesEnTerminal.length,
    //                 tmHoy: formatearMiles(toneladasTotales),
    //                 metricValue: formatearMiles(toneladasTotales),
    //                 // Dinamismo: Cambia a TEU si es de contenedores
    //                 metricLabel: (tipoCarga === 'CONTENEDORES' || descripcionMapa.toUpperCase().includes('CONTENEDORES')) ? 'TEU HOY' : 'TM HOY'
    //             },
    //             navesAtendidas: navesEnTerminal
    //         };
    //     });
    // }

    // public transform(data: any, context: any): any[] {
    //     // 1. APLANAMIENTO: Convertimos el listado en un array plano de barcos
    //     const listado = Array.isArray(data.listado) ? data.listado : Object.values(data.listado || {}).flat();
    //     const mapa = context.mapaPortuario || {};

    //     let puertoActual = (context.puerto || 'BUENAVENTURA').trim().toUpperCase();
    //     if (puertoActual === 'SANTAMARTA') puertoActual = 'SANTA_MARTA';

    //     const datosDelPuerto = mapa[puertoActual] || {};
    //     const infraestructuraPuerto = datosDelPuerto.infraestructura || {};

    //     // 2. ÍNDICE DE EQUIVALENCIAS (Mapa de Alias a Llave Real)
    //     const mapaAlias: { [key: string]: string } = {};
    //     Object.keys(infraestructuraPuerto).forEach(llaveReal => {
    //         const info = infraestructuraPuerto[llaveReal];
    //         mapaAlias[llaveReal.toUpperCase()] = llaveReal;
    //         if (info.nombre) mapaAlias[info.nombre.toUpperCase()] = llaveReal;
    //         if (Array.isArray(info.alias)) info.alias.forEach((a: string) => mapaAlias[a.toUpperCase()] = llaveReal);
    //     });

    //     const formatearMiles = (valor: number) => valor >= 1000 ? (valor / 1000).toFixed(1) + 'k' : valor.toString();

    //     // 3. ARMADO VISUAL
    //     return Object.keys(infraestructuraPuerto).map((nombreTerm: string) => {
    //         const infoTerminalMapa = infraestructuraPuerto[nombreTerm];

    //         // Filtro estricto usando el mapa de alias
    //         const navesEnTerminal = listado.filter((nave: any) => {
    //             const termNave = (nave.terminal || '').toString().trim().toUpperCase();
    //             const llaveEncontrada = mapaAlias[termNave] || termNave;
    //             return llaveEncontrada === nombreTerm;
    //         });

    //         const toneladasTotales = navesEnTerminal.reduce((acc: any, nave: any) => acc + (parseFloat(nave.trabajoOperacion || nave.toneladas || 0) || 0), 0);

    //         // Mapeo de muelles
    //         const muellesCrudos = infoTerminalMapa.muelles || infoTerminalMapa.docks || [];
    //         const muellesEstructurados = muellesCrudos.map((m: any) => {
    //             const idMuelle = (m.id || m.label || m.nombre || m.muelle || 'Muelle').toString().trim();

    //             const barcoEnMuelle = navesEnTerminal.find((nave: any) => {
    //                 const muelleExcel = (nave.muelle || nave.pier || '').toString().trim().toUpperCase().replace(/[\s\-]/g, '');
    //                 const muelleUI = idMuelle.trim().toUpperCase().replace(/[\s\-]/g, '');
    //                 if (!muelleExcel || ['TBC', 'TBA', 'PENDING', 'NULL'].includes(muelleExcel)) return false;
    //                 return muelleExcel === muelleUI;
    //             });

    //             return {
    //                 id: idMuelle,
    //                 label: idMuelle,
    //                 especialidad: m.especialidad || m.esp || 'General',
    //                 calado: m.calado || m.draft || '-',
    //                 barcoAtracado: barcoEnMuelle ? barcoEnMuelle.motonave : null,
    //                 operacionBarco: barcoEnMuelle ? barcoEnMuelle.trabajoOperacion : 'Disponible',
    //                 estado: barcoEnMuelle ? 'ocupado' : 'libre',
    //                 class: barcoEnMuelle ? 'dock-ocupado' : 'dock-libre'
    //             };
    //         });

    //         return {
    //             nombreTerminal: nombreTerm,
    //             nombre: infoTerminalMapa.nombre || nombreTerm,
    //             descripcion: infoTerminalMapa.descripcion || 'DESCRIPCIÓN DEL TERMINAL',
    //             legend: infoTerminalMapa.leyenda || infoTerminalMapa.legend || '',
    //             docks: muellesEstructurados,
    //             tableData: muellesEstructurados,
    //             operativo: infoTerminalMapa.estado !== 'CONGESTIONADO',
    //             status: infoTerminalMapa.estado === 'CONGESTIONADO' ? 'warning' : 'success',
    //             kpis: {
    //                 ocupacion: infoTerminalMapa.ocupacion || '50%',
    //                 motonaves: navesEnTerminal.length,
    //                 tmHoy: formatearMiles(toneladasTotales),
    //                 metricValue: formatearMiles(toneladasTotales),
    //                 metricLabel: (infoTerminalMapa.tipoCarga || '').toUpperCase().includes('CONTENEDORES') ? 'TEU HOY' : 'TM HOY'
    //             },
    //             navesAtendidas: navesEnTerminal
    //         };
    //     });
    // }

    // public transform(data: any, context: any): any[] {
    //     console.log("DEBUG DATA:", data);

    //     // 1. ESTRATEGIA DE BÚSQUEDA DE LISTADO
    //     // Si data.listado es un objeto con nombres de terminales como llaves,
    //     // debemos extraer todos los barcos de todas las llaves.
    //     let listado: any[] = [];
    //     if (data.listado) {
    //         if (Array.isArray(data.listado)) {
    //             listado = data.listado;
    //         } else if (typeof data.listado === 'object') {
    //             // Aplanamos todo el contenido del objeto, sin importar las llaves
    //             listado = Object.values(data.listado).flatMap(val => Array.isArray(val) ? val : []);
    //         }
    //     }

    //     // Si después de esto listado sigue vacío, el error está en la API, no en tu código.
    //     console.log("✅ Total de barcos encontrados tras aplanar:", listado.length);
    //     const mapa = context.mapaPortuario || {};

    //     let puertoActual = (context.puerto || 'BUENAVENTURA').trim().toUpperCase();
    //     if (puertoActual === 'SANTAMARTA') puertoActual = 'SANTA_MARTA';

    //     const datosDelPuerto = mapa[puertoActual] || {};
    //     const infraestructuraPuerto = datosDelPuerto.infraestructura || {};

    //     const mapaAlias: { [key: string]: string } = {};
    //     Object.keys(infraestructuraPuerto).forEach(llaveReal => {
    //         const info = infraestructuraPuerto[llaveReal];
    //         mapaAlias[llaveReal.toUpperCase()] = llaveReal;
    //         if (info.nombre) mapaAlias[info.nombre.toUpperCase()] = llaveReal;
    //         if (Array.isArray(info.alias)) info.alias.forEach((a: string) => mapaAlias[a.toUpperCase()] = llaveReal);
    //     });

    //     const formatearMiles = (valor: number) => valor >= 1000 ? (valor / 1000).toFixed(1) + 'k' : valor.toString();

    //     return Object.keys(infraestructuraPuerto).map((nombreTerm: string) => {
    //         const infoTerminalMapa = infraestructuraPuerto[nombreTerm];

    //         const navesEnTerminal = listado.filter((nave: any) => {
    //             const termNave = (nave.terminal || '').toString().trim().toUpperCase();
    //             const llaveEncontrada = mapaAlias[termNave] || termNave;
    //             return llaveEncontrada === nombreTerm;
    //         });

    //         const toneladasTotales = navesEnTerminal.reduce((acc: any, nave: any) => acc + (parseFloat(nave.trabajoOperacion || nave.toneladas || 0) || 0), 0);

    //         const muellesCrudos = infoTerminalMapa.muelles || infoTerminalMapa.docks || [];

    //         const muellesEstructurados = muellesCrudos.map((m: any) => {
    //             // Normalizamos el ID del muelle para comparación (quitamos caracteres especiales)
    //             const idMuelle = (m.id || m.label || m.nombre || m.muelle || 'Muelle').toString().trim();
    //             const idMuelleClean = idMuelle.toUpperCase().replace(/[^A-Z0-9]/g, '');

    //             const barcoEnMuelle = navesEnTerminal.find((nave: any) => {
    //                 // 1. Normalización del muelle para el match
    //                 const muelleExcel = (nave.muelle || nave.pier || '').toString().replace(/\D/g, '');
    //                 const muelleUI = idMuelle.toString().replace(/\D/g, '');

    //                 const esElMuelleCorrecto = muelleExcel === muelleUI && muelleExcel !== '';

    //                 // 2. LOG CRÍTICO: Si detectamos que es el muelle correcto, veamos qué trae la nave
    //                 if (esElMuelleCorrecto) {
    //                     console.log("🚢 BARCO ENCONTRADO EN MUELLE " + idMuelle + ":", nave);
    //                     console.log("➡️ ¿Nombre de la motonave detectado?:", nave.motonave || nave.nombre || nave.shipName);
    //                 }

    //                 return esElMuelleCorrecto;
    //             });

    //             return {
    //                 id: idMuelle,
    //                 label: idMuelle,
    //                 especialidad: m.especialidad || m.esp || 'General',
    //                 calado: m.calado || m.draft || '-',
    //                 // Aquí capturamos los datos reales del barco encontrado
    //                 barcoAtracado: barcoEnMuelle ? barcoEnMuelle.motonave : null,
    //                 operacionBarco: barcoEnMuelle ? (barcoEnMuelle.trabajoOperacion || 'Operando') : 'Disponible',
    //                 estado: barcoEnMuelle ? 'ocupado' : 'libre',
    //                 class: barcoEnMuelle ? 'dock-ocupado' : 'dock-libre'
    //             };
    //         });

    //         return {
    //             nombreTerminal: nombreTerm,
    //             nombre: infoTerminalMapa.nombre || nombreTerm,
    //             descripcion: infoTerminalMapa.descripcion || 'DESCRIPCIÓN DEL TERMINAL',
    //             legend: infoTerminalMapa.leyenda || infoTerminalMapa.legend || '',
    //             docks: muellesEstructurados,
    //             tableData: muellesEstructurados,
    //             operativo: infoTerminalMapa.estado !== 'CONGESTIONADO',
    //             status: infoTerminalMapa.estado === 'CONGESTIONADO' ? 'warning' : 'success',
    //             kpis: {
    //                 ocupacion: infoTerminalMapa.ocupacion || '50%',
    //                 motonaves: navesEnTerminal.length,
    //                 tmHoy: formatearMiles(toneladasTotales),
    //                 metricValue: formatearMiles(toneladasTotales),
    //                 metricLabel: (infoTerminalMapa.tipoCarga || '').toUpperCase().includes('CONTENEDORES') ? 'TEU HOY' : 'TM HOY'
    //             },
    //             navesAtendidas: navesEnTerminal
    //         };
    //     });
    // }

    // public transform(data: any, context: any): any[] {
    //     // 1. APLANAMIENTO ROBUSTO: Asegura que 'listado' siempre sea un array plano
    //     const listado = Array.isArray(data.listado) ? data.listado : Object.values(data.listado || {}).flat();
    //     const mapa = context.mapaPortuario || {};

    //     let puertoActual = (context.puerto || 'BUENAVENTURA').trim().toUpperCase();
    //     if (puertoActual === 'SANTAMARTA') puertoActual = 'SANTA_MARTA';

    //     const datosDelPuerto = mapa[puertoActual] || {};
    //     const infraestructuraPuerto = datosDelPuerto.infraestructura || {};

    //     // 2. ÍNDICE DINÁMICO DE TERMINALES (Mapa de Alias a Llave Real)
    //     // Esto resuelve el problema de que el Excel diga 'SPRB' y el mapa diga 'SPRBUN'
    //     const mapaAlias: { [key: string]: string } = {};
    //     Object.keys(infraestructuraPuerto).forEach(llaveReal => {
    //         const info = infraestructuraPuerto[llaveReal];
    //         mapaAlias[llaveReal.toUpperCase()] = llaveReal;
    //         if (info.nombre) mapaAlias[info.nombre.toUpperCase()] = llaveReal;
    //         if (Array.isArray(info.alias)) info.alias.forEach((a: string) => mapaAlias[a.toUpperCase()] = llaveReal);
    //     });

    //     const formatearMiles = (valor: number) => valor >= 1000 ? (valor / 1000).toFixed(1) + 'k' : valor.toString();

    //     // 3. ARMADO VISUAL Y PROCESAMIENTO
    //     return Object.keys(infraestructuraPuerto).map((nombreTerm: string) => {
    //         const infoTerminalMapa = infraestructuraPuerto[nombreTerm];

    //         // Filtramos barcos usando el índice de alias
    //         const navesEnTerminal = listado.filter((nave: any) => {
    //             const termNave = (nave.terminal || '').toString().trim().toUpperCase();
    //             const llaveEncontrada = mapaAlias[termNave] || termNave;
    //             return llaveEncontrada === nombreTerm;
    //         });

    //         const toneladasTotales = navesEnTerminal.reduce((acc: any, nave: any) => acc + (parseFloat(nave.trabajoOperacion || nave.toneladas || 0) || 0), 0);

    //         // Mapeo de muelles con limpieza numérica para match perfecto
    //         const muellesCrudos = infoTerminalMapa.muelles || infoTerminalMapa.docks || [];
    //         console.log("🚢 muellesCrudos", muellesCrudos);
    //         const muellesEstructurados = muellesCrudos.map((m: any) => {
    //             console.log("🚢 muellesEstructurados", m);
    //             const idMuelle = (m.id || m.label || m.nombre || m.muelle || 'Muelle').toString().trim();
    //             const idMuelleSoloNumeros = idMuelle.replace(/\D/g, ''); // Normalización: 'M-9' -> '9'
    //             console.log("🚢 idMuelle:", idMuelle);

    //             const barcoEnMuelle = navesEnTerminal.find((nave: any) => {
    //                 console.log("🚢 BARCO ENCONTRADO:", nave);
    //                 // 1. Normalización numérica
    //                 const muelleNave = (nave.muelle || '').toString().replace(/\D/g, '');
    //                 const muelleUI = idMuelleSoloNumeros;
    //                 console.log("🚢 muelleNave", muelleNave);
    //                 console.log("🚢 muelleUI:", muelleUI);

    //                 const esMatch = muelleNave === muelleUI && muelleNave !== '';

    //                 // 2. LOG DE AUDITORÍA: Solo imprimimos si encontramos un barco
    //                 if (esMatch) {
    //                     console.log("🚢 BARCO ENCONTRADO:", nave);
    //                     console.log("🔍 ¿Tiene propiedad 'motonave'?:", nave.hasOwnProperty('motonave'));
    //                     console.log("🔍 Valor de 'motonave':", nave.motonave);
    //                 }

    //                 return esMatch;
    //             });

    //             return {
    //                 id: idMuelle,
    //                 label: idMuelle,
    //                 especialidad: m.especialidad || m.esp || 'General',
    //                 calado: m.calado || m.draft || '-',
    //                 barcoAtracado: barcoEnMuelle ? barcoEnMuelle.motonave : null, // Campo real de la BD
    //                 operacionBarco: barcoEnMuelle ? (barcoEnMuelle.trabajoOperacion || 'Operando') : 'Disponible',
    //                 estado: barcoEnMuelle ? 'ocupado' : 'libre',
    //                 class: barcoEnMuelle ? 'dock-ocupado' : 'dock-libre'
    //             };
    //         });

    //         return {
    //             nombreTerminal: nombreTerm,
    //             nombre: infoTerminalMapa.nombre || nombreTerm,
    //             descripcion: infoTerminalMapa.descripcion || 'DESCRIPCIÓN DEL TERMINAL',
    //             legend: infoTerminalMapa.leyenda || infoTerminalMapa.legend || '',
    //             docks: muellesEstructurados,
    //             tableData: muellesEstructurados,
    //             operativo: infoTerminalMapa.estado !== 'CONGESTIONADO',
    //             status: infoTerminalMapa.estado === 'CONGESTIONADO' ? 'warning' : 'success',
    //             kpis: {
    //                 ocupacion: infoTerminalMapa.ocupacion || '50%',
    //                 motonaves: navesEnTerminal.length,
    //                 tmHoy: formatearMiles(toneladasTotales),
    //                 metricValue: formatearMiles(toneladasTotales),
    //                 metricLabel: (infoTerminalMapa.tipoCarga || '').toUpperCase().includes('CONTENEDORES') ? 'TEU HOY' : 'TM HOY'
    //             },
    //             navesAtendidas: navesEnTerminal
    //         };
    //     });
    // }


    // public transform(data: any, context: any): any[] {
    //     // 1. APLANAMIENTO: Convertimos el listado en un array plano de barcos
    //     const listado = Array.isArray(data.listado) ? data.listado : Object.values(data.listado || {}).flat();
    //     const mapa = context.mapaPortuario || {};

    //     let puertoActual = (context.puerto || 'BUENAVENTURA').trim().toUpperCase();
    //     if (puertoActual === 'SANTAMARTA') puertoActual = 'SANTA_MARTA';

    //     const datosDelPuerto = mapa[puertoActual] || {};
    //     const infraestructuraPuerto = datosDelPuerto.infraestructura || {};

    //     // 2. ÍNDICE DE EQUIVALENCIAS (Mapa de Alias a Llave Real)
    //     const mapaAlias: { [key: string]: string } = {};
    //     Object.keys(infraestructuraPuerto).forEach(llaveReal => {
    //         const info = infraestructuraPuerto[llaveReal];
    //         mapaAlias[llaveReal.toUpperCase()] = llaveReal;
    //         if (info.nombre) mapaAlias[info.nombre.toUpperCase()] = llaveReal;
    //         if (Array.isArray(info.alias)) info.alias.forEach((a: string) => mapaAlias[a.toUpperCase()] = llaveReal);
    //     });

    //     const formatearMiles = (valor: number) => valor >= 1000 ? (valor / 1000).toFixed(1) + 'k' : valor.toString();

    //     // 3. ARMADO VISUAL Y PROCESAMIENTO DE TERMINALES
    //     return Object.keys(infraestructuraPuerto).map((nombreTerm: string) => {
    //         const infoTerminalMapa = infraestructuraPuerto[nombreTerm];

    //         // Filtrar barcos de esta terminal específica
    //         const navesEnTerminal = listado.filter((nave: any) => {
    //             const termNave = (nave.terminal || '').toString().trim().toUpperCase();
    //             const llaveEncontrada = mapaAlias[termNave] || termNave;
    //             return llaveEncontrada === nombreTerm;
    //         });

    //         const toneladasTotales = navesEnTerminal.reduce((acc: any, nave: any) => acc + (parseFloat(nave.trabajoOperacion || nave.toneladas || 0) || 0), 0);

    //         // Mapeo de muelles utilizando el dbId técnico real de la base de datos
    //         const muellesCrudos = infoTerminalMapa.muelles || infoTerminalMapa.docks || [];
    //         const muellesEstructurados = muellesCrudos.map((m: any) => {
    //             const idMuelleVisual = (m.id || m.label || 'Muelle').toString().trim();

    //             // 🚨 CLAVE: Usamos el dbId configurado en la API (ej: "9"), si no viene, usamos el id visual
    //             const idConfigReal = (m.dbId || m.id || '').toString().trim().toUpperCase();

    //             const barcoEnMuelle = navesEnTerminal.find((nave: any) => {
    //                 const muelleNave = (nave.muelle || '').toString().trim().toUpperCase();
    //                 return muelleNave === idConfigReal && muelleNave !== '';
    //             });

    //             return {
    //                 id: idMuelleVisual, // "M-1" para pintar en la tabla
    //                 label: idMuelleVisual,
    //                 especialidad: m.esp || m.especialidad || 'General',
    //                 calado: m.calado || m.draft || '-',
    //                 barcoAtracado: barcoEnMuelle ? barcoEnMuelle.motonave : null, // Campo exacto SQL
    //                 operacionBarco: barcoEnMuelle ? (barcoEnMuelle.trabajoOperacion || 'Operando') : 'Disponible',
    //                 estado: barcoEnMuelle ? 'ocupado' : 'libre',
    //                 class: barcoEnMuelle ? 'dock-ocupado' : 'dock-libre'
    //             };
    //         });

    //         return {
    //             nombreTerminal: nombreTerm,
    //             nombre: infoTerminalMapa.nombre || nombreTerm,
    //             descripcion: infoTerminalMapa.descripcion || infoTerminalMapa.desc || 'DESCRIPCIÓN DEL TERMINAL',
    //             legend: infoTerminalMapa.leyenda || infoTerminalMapa.legend || '',
    //             docks: muellesEstructurados,
    //             tableData: muellesEstructurados,
    //             operativo: infoTerminalMapa.estado !== 'CONGESTIONADO',
    //             status: infoTerminalMapa.estado === 'CONGESTIONADO' ? 'warning' : 'success',
    //             kpis: {
    //                 ocupacion: infoTerminalMapa.ocupacion || '50%',
    //                 motonaves: navesEnTerminal.length,
    //                 tmHoy: formatearMiles(toneladasTotales),
    //                 metricValue: formatearMiles(toneladasTotales),
    //                 metricLabel: (infoTerminalMapa.tipoCarga || '').toUpperCase().includes('CONTENEDORES') ? 'TEU HOY' : 'TM HOY'
    //             },
    //             navesAtendidas: navesEnTerminal
    //         };
    //     });
    // }


    // public transform(data: any, context: any): any[] {
    //     // 1. APLANAMIENTO ROBUSTO
    //     const listado = Array.isArray(data.listado) ? data.listado : Object.values(data.listado || {}).flat();
    //     const mapa = context.mapaPortuario || {};

    //     let puertoActual = (context.puerto || 'BUENAVENTURA').trim().toUpperCase();
    //     if (puertoActual === 'SANTAMARTA') puertoActual = 'SANTA_MARTA';

    //     const datosDelPuerto = mapa[puertoActual] || {};
    //     const infraestructuraPuerto = datosDelPuerto.infraestructura || {};

    //     // 2. ÍNDICE DE EQUIVALENCIAS CON SALVAGUARDA PARA LA BD
    //     const mapaAlias: { [key: string]: string } = {};
    //     Object.keys(infraestructuraPuerto).forEach(llaveReal => {
    //         const info = infraestructuraPuerto[llaveReal];
    //         mapaAlias[llaveReal.toUpperCase()] = llaveReal;
    //         if (info.nombre) mapaAlias[info.nombre.toUpperCase()] = llaveReal;
    //         if (Array.isArray(info.alias)) info.alias.forEach((a: string) => mapaAlias[a.toUpperCase()] = llaveReal);
    //     });

    //     // Parche de contingencia directo en el adaptador por si el APIM no incluye estas variantes
    //     mapaAlias['SPBUN'] = 'SPRBUN';
    //     mapaAlias['SPRB'] = 'SPRBUN';

    //     const formatearMiles = (valor: number) => valor >= 1000 ? (valor / 1000).toFixed(1) + 'k' : valor.toString();

    //     // 3. ARMADO VISUAL Y FILTRADO PRIORIZADO
    //     return Object.keys(infraestructuraPuerto).map((nombreTerm: string) => {
    //         const infoTerminalMapa = infraestructuraPuerto[nombreTerm];

    //         // Filtramos barcos pertenecientes a la terminal
    //         const navesEnTerminal = listado.filter((nave: any) => {
    //             const termNave = (nave.terminal || '').toString().trim().toUpperCase();
    //             const llaveEncontrada = mapaAlias[termNave] || termNave;
    //             return llaveEncontrada === nombreTerm;
    //         });

    //         // 🚨 CRÍTICO: Ordenamos las naves para que las que están 'ATRACADO' queden al principio del array.
    //         // Esto garantiza que el .find() capture el barco real en muelle y ignore los que están en FONDEO o ZARPÓ.
    //         const navesPriorizadas = [...navesEnTerminal].sort((a, b) => {
    //             const estadoA = (a.posicion || '').toString().toUpperCase() === 'ATRACADO' ? 1 : 0;
    //             const estadoB = (b.posicion || '').toString().toUpperCase() === 'ATRACADO' ? 1 : 0;
    //             return estadoB - estadoA; // Los de valor 1 (ATRACADO) suben al inicio
    //         });

    //         const toneladasTotales = navesPriorizadas.reduce((acc, nave) => acc + (parseFloat(nave.trabajoOperacion || nave.toneladas || 0) || 0), 0);

    //         const muellesCrudos = infoTerminalMapa.muelles || infoTerminalMapa.docks || [];
    //         const muellesEstructurados = muellesCrudos.map((m: any) => {
    //             const idMuelleVisual = (m.id || m.label || 'Muelle').toString().trim();
    //             const idConfigReal = (m.dbId || m.id || '').toString().trim().toUpperCase();

    //             // Buscamos en el listado priorizado
    //             const barcoEnMuelle = navesPriorizadas.find((nave: any) => {
    //                 const muelleNave = (nave.muelle || '').toString().trim().toUpperCase();
    //                 return muelleNave === idConfigReal && muelleNave !== '';
    //             });

    //             return {
    //                 id: idMuelleVisual,
    //                 label: idMuelleVisual,
    //                 especialidad: m.esp || m.especialidad || 'General',
    //                 calado: m.calado || m.draft || '-',
    //                 barcoAtracado: barcoEnMuelle ? barcoEnMuelle.motonave : null,
    //                 operacionBarco: barcoEnMuelle ? (barcoEnMuelle.trabajoOperacion || 'Operando') : 'Disponible',
    //                 estado: barcoEnMuelle ? 'ocupado' : 'libre',
    //                 class: barcoEnMuelle ? 'dock-ocupado' : 'dock-libre'
    //             };
    //         });

    //         return {
    //             nombreTerminal: nombreTerm,
    //             nombre: infoTerminalMapa.nombre || nombreTerm,
    //             descripcion: infoTerminalMapa.descripcion || infoTerminalMapa.desc || 'DESCRIPCIÓN DEL TERMINAL',
    //             legend: infoTerminalMapa.leyenda || infoTerminalMapa.legend || '',
    //             docks: muellesEstructurados,
    //             tableData: muellesEstructurados,
    //             operativo: infoTerminalMapa.estado !== 'CONGESTIONADO',
    //             status: infoTerminalMapa.estado === 'CONGESTIONADO' ? 'warning' : 'success',
    //             kpis: {
    //                 ocupacion: infoTerminalMapa.ocupacion || '50%',
    //                 motonaves: navesPriorizadas.filter(n => (n.posicion || '').toString().toUpperCase() === 'ATRACADO').length,
    //                 tmHoy: formatearMiles(toneladasTotales),
    //                 metricValue: formatearMiles(toneladasTotales),
    //                 metricLabel: (infoTerminalMapa.tipoCarga || '').toUpperCase().includes('CONTENEDORES') ? 'TEU HOY' : 'TM HOY'
    //             },
    //             navesAtendidas: navesPriorizadas
    //         };
    //     });
    // }


    public transform(data: any, context: any): any[] {
        const listado = Array.isArray(data.listado) ? data.listado : Object.values(data.listado || {}).flat();
        const mapa = context.mapaPortuario || {};

        let puertoActual = (context.puerto || 'BUENAVENTURA').trim().toUpperCase();
        if (puertoActual === 'SANTAMARTA') puertoActual = 'SANTA_MARTA';

        const datosDelPuerto = mapa[puertoActual] || {};
        const infraestructuraPuerto = datosDelPuerto.infraestructura || {};

        // 1. DICCIONARIO DE ALIAS (Seguro y directo)
        const mapaAlias: { [key: string]: string } = {};
        Object.keys(infraestructuraPuerto).forEach(llaveReal => {
            const info = infraestructuraPuerto[llaveReal];
            mapaAlias[llaveReal.toUpperCase()] = llaveReal;
            if (info.nombre) mapaAlias[info.nombre.toUpperCase()] = llaveReal;
            if (Array.isArray(info.alias)) {
                info.alias.forEach((a: string) => mapaAlias[a.toUpperCase().trim()] = llaveReal);
            }
        });

        // Parches directos de la base de datos (para Buenaventura)
        mapaAlias['SPBUN'] = 'SPRBUN';
        mapaAlias['SPRB'] = 'SPRBUN';

        const formatearMiles = (valor: number) => valor >= 1000 ? (valor / 1000).toFixed(1) + 'k' : valor.toString();

        // 2. PROCESAMIENTO
        return Object.keys(infraestructuraPuerto).map((nombreTerm: string) => {
            const infoTerminalMapa = infraestructuraPuerto[nombreTerm];

            // Filtro estricto de terminales
            const navesEnTerminal = listado.filter((nave: any) => {
                const termNave = (nave.terminal || '').toString().trim().toUpperCase();
                if (!termNave) return false;

                // Si el alias de la BD coincide con la llave del mapa, lo dejamos pasar
                return mapaAlias[termNave] === nombreTerm || termNave === nombreTerm;
            });

            // Priorizamos los barcos ATRACADOS para que tomen el muelle primero
            const navesPriorizadas = [...navesEnTerminal].sort((a, b) => {
                const estadoA = (a.posicion || '').toString().toUpperCase() === 'ATRACADO' ? 1 : 0;
                const estadoB = (b.posicion || '').toString().toUpperCase() === 'ATRACADO' ? 1 : 0;
                return estadoB - estadoA; // Los ATRACADOS suben a la posición 0 del array
            });

            const toneladasTotales = navesPriorizadas.reduce((acc, nave) => acc + (parseFloat(nave.trabajoOperacion || nave.toneladas || 0) || 0), 0);

            const muellesCrudos = infoTerminalMapa.muelles || infoTerminalMapa.docks || [];
            const muellesEstructurados = muellesCrudos.map((m: any) => {
                // El ID original (ej: "M-1")
                const idMuelleVisual = (m.id || m.label || 'Muelle').toString().trim().toUpperCase();
                // El ID técnico de la BD (ej: "9" o "TC-1")
                const idConfigReal = (m.dbId || m.id || '').toString().trim().toUpperCase();

                // 🚨 BÚSQUEDA SEGURA
                const barcoEnMuelle = navesPriorizadas.find((nave: any) => {
                    const muelleNaveRaw = (nave.muelle || '').toString().trim().toUpperCase();
                    if (!muelleNaveRaw || ['TBC', 'TBA', 'PENDING', 'NULL', '—'].includes(muelleNaveRaw)) return false;

                    // 1. Match Exacto con el ID de la base de datos
                    if (muelleNaveRaw === idConfigReal) return true;

                    // 2. Match Exacto con el ID visual
                    if (muelleNaveRaw === idMuelleVisual) return true;

                    // 3. Match Seguro (Quita solo espacios y guiones, MANTIENE las letras)
                    // Esto soluciona que "TC-1" haga match con "TC1" sin confundirse con "M-1"
                    const cleanNave = muelleNaveRaw.replace(/[\s\-]/g, '');
                    const cleanConfig = idConfigReal.replace(/[\s\-]/g, '');
                    const cleanVisual = idMuelleVisual.replace(/[\s\-]/g, '');

                    if (cleanNave === cleanConfig || cleanNave === cleanVisual) return true;

                    return false;
                });

                return {
                    id: (m.id || m.label || 'Muelle'), // Mantiene "M-1" para el HTML
                    label: (m.id || m.label || 'Muelle'),
                    especialidad: m.esp || m.especialidad || 'General',
                    calado: m.calado || m.draft || '-',
                    barcoAtracado: barcoEnMuelle ? barcoEnMuelle.motonave : null,
                    operacionBarco: barcoEnMuelle ? (barcoEnMuelle.trabajoOperacion || 'Operando') : 'Disponible',
                    estado: barcoEnMuelle ? 'ocupado' : 'libre',
                    class: barcoEnMuelle ? 'dock-ocupado' : 'dock-libre'
                };
            });

            return {
                nombreTerminal: nombreTerm,
                nombre: infoTerminalMapa.nombre || nombreTerm,
                descripcion: infoTerminalMapa.descripcion || infoTerminalMapa.desc || 'DESCRIPCIÓN DEL TERMINAL',
                legend: infoTerminalMapa.leyenda || infoTerminalMapa.legend || '',
                docks: muellesEstructurados,
                tableData: muellesEstructurados,
                operativo: infoTerminalMapa.estado !== 'CONGESTIONADO',
                status: infoTerminalMapa.estado === 'CONGESTIONADO' ? 'warning' : 'success',
                kpis: {
                    ocupacion: infoTerminalMapa.ocupacion || '50%',
                    motonaves: navesPriorizadas.filter(n => (n.posicion || '').toString().toUpperCase() === 'ATRACADO').length,
                    tmHoy: formatearMiles(toneladasTotales),
                    metricValue: formatearMiles(toneladasTotales),
                    metricLabel: (infoTerminalMapa.tipoCarga || '').toUpperCase().includes('CONTENEDORES') ? 'TEU HOY' : 'TM HOY'
                },
                navesAtendidas: navesPriorizadas
            };
        });
    }


}

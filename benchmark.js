/**
 * Mide latencia de un endpoint usando solo JavaScript nativo.
 * Uso: node benchmark.js <URL> [numero_de_peticiones]
 */

const url = process.argv[2];
const n = Number(process.argv[3]) || 200;

if (!url) {
  console.error('Falta la URL.\nUso: node benchmark.js <URL> [numero_de_peticiones]');
  process.exit(1);
}

function percentil(valoresOrdenados, p) {
  const idx = Math.ceil((p / 100) * valoresOrdenados.length) - 1;
  return valoresOrdenados[Math.max(0, idx)];
}

(async () => {
  console.log(`\nMidiendo ${url} (${n} peticiones)\n`);
  const tiempos = [];
  let errores = 0;

  for (let i = 0; i < n; i++) {
    const inicio = Date.now();
    try {
      const res = await fetch(url);
      await res.text();
      if (!res.ok) errores++;
    } catch {
      errores++;
    }
    tiempos.push(Date.now() - inicio);
    if ((i + 1) % 50 === 0) process.stdout.write(`  ${i + 1}/${n}\r`);
  }

  tiempos.sort((a, b) => a - b);
  const suma = tiempos.reduce((s, t) => s + t, 0);
  const prom = suma / tiempos.length;
  const p95 = percentil(tiempos, 95);
  const max = tiempos[tiempos.length - 1];

  console.log('\n------------ RESULTADOS ------------');
  console.log(`Peticiones        : ${n}`);
  console.log(`Latencia promedio : ${prom.toFixed(2)} ms`);
  console.log(`Latencia p95      : ${p95.toFixed(2)} ms`);
  console.log(`Latencia max      : ${max.toFixed(2)} ms`);
  console.log(`Errores           : ${errores}`);
  console.log('------------------------------------');
  console.log('\nFila para el README:');
  console.log(`| ${url} | ${prom.toFixed(2)} | ${p95.toFixed(2)} | ${max.toFixed(2)} |`);
})();

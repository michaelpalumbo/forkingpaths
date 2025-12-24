import { OSCQueryDiscovery } from "oscquery";

async function fetchRawOnly(ip, port) {
  const d = new OSCQueryDiscovery();
  const svc = await d.queryNewService(ip, port);

  await svc.update();

  // 1. get only paths ending in /raw
  const rawPaths = svc
    .flat()
    .map(m => m.full_path)
    .filter(p => p && p.endsWith("/raw"));

  console.log("RAW endpoints:", rawPaths);

  // 2. read values
  const rawValues = {};

  for (const path of rawPaths) {
    const node = svc.resolvePath(path);
    if (!node) continue;

    // usually 1 arg for /raw, but this is safe
    const values = [];
    let i = 0;
    while (true) {
      const v = node.getValue(i);
      if (v === null || v === undefined) break;
      values.push(v);
      i++;
    }

    rawValues[path] = values;
  }

  console.log("RAW VALUES:");
  console.log(rawValues);

  return rawValues;
}

fetchRawOnly("127.0.0.1", 30339).catch(err => {
  console.error(err?.message ?? err);
});

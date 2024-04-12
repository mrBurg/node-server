import { networkInterfaces, NetworkInterfaceInfo } from 'os';

export function getNetworkInterface() {
  const interfaces = networkInterfaces();
  const results = {} as Record<string, string[]>;

  for (const [name, value] of Object.entries(interfaces)) {
    for (const {
      family,
      internal,
      address,
    } of value as NetworkInterfaceInfo[]) {
      if (family === 'IPv4' && !internal) {
        if (!results[name]) {
          results[name] = [];
        }

        results[name].push(address);
      }
    }
  }

  return results;
}

export const serverCallback = ((err) => (protocol: string, port: number) => {
  if (err) {
    throw err;
  }

  const wrapper = (data: string) =>
    `\n    \x1b[102m\x1b[30m${data}\x1b[0m\x1b[92m`;
  const hostsData = getNetworkInterface();
  let hosts = `${wrapper('["localhost"]')}`;

  for (const item in hostsData) {
    hosts += `${wrapper(JSON.stringify(hostsData[item]))}\x1b[0m\t ${item}`;
  }

  console.log(
    `\x1b[92m${protocol} App ready on =>\n  host ->${hosts}\n\x1b[92m  port ->${wrapper(
      `["${port}"]`
    )}\n\x1b[0m`
  );

  return void 0;
})();

export function groupMachinesByCategory(machines) {
  return machines.reduce((accumulator, machine) => {
    const key = machine.categorie;

    if (!accumulator[key]) {
      accumulator[key] = [];
    }

    accumulator[key].push(machine);
    accumulator[key].sort((left, right) => left.numeroParc.localeCompare(right.numeroParc, undefined, { numeric: true }));

    return accumulator;
  }, {});
}

export function getMachineIdsByCategory(machinesByCategory) {
  return Object.fromEntries(
    Object.entries(machinesByCategory).map(([category, items]) => [category, items.map((item) => item.id)]),
  );
}

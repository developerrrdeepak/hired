// Vultr integration - temporarily using mock data

export const listInstances = async () => {
  return { instances: [] };
};

export const createInstance = async (plan: string, region: string, os_id: number) => {
  return { instance: { id: 'mock-instance' } };
};

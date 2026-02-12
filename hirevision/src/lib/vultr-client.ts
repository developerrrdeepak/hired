// @ts-ignore - Vultr SDK types
import VultrNode from '@vultr/vultr-node';

export const VultrClient = VultrNode.initialize({
  apiKey: process.env.VULTR_API_KEY,
});


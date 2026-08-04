const fs = require('fs');
const content = fs.readFileSync('src/api.ts', 'utf8');
const toAppend = `
// ==================================================================
// BRAND RESOURCES (Stored in global_settings)
// ==================================================================
export const brandResourcesApi = {
  getAll: async () => {
    try {
      return await settingsApi.get<BrandResource[]>('brandResources');
    } catch (e) {
      return [];
    }
  },
  saveAll: (resources: BrandResource[]) => settingsApi.save('brandResources', resources),
};
`;
fs.writeFileSync('src/api.ts', content + toAppend);

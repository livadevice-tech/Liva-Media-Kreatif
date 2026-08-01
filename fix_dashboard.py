with open('src/components/host/HostDashboard.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "import { getAvatarUrl, getBrandStyle, formatDateUI } from '../../shared/utils/liveReportPanel';",
    "export const getAvatarUrl = (name: string) => `https://ui-avatars.com/api/?name=${name}&background=random`;"
)

with open('src/components/host/HostDashboard.tsx', 'w') as f:
    f.write(content)

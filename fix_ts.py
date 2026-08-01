import os
import glob

type_def = 'export type ReportDateFilterType = "custom" | "daily" | "weekly" | "monthly" | "latest" | "all" | "month";\n'

# 1. Add ReportDateFilterType to src/types.ts
with open('src/types.ts', 'r') as f:
    types_content = f.read()
if 'ReportDateFilterType' not in types_content:
    with open('src/types.ts', 'w') as f:
        f.write(types_content + '\n' + type_def)

# 2. Add import to App.tsx
with open('src/App.tsx', 'r') as f:
    app_content = f.read()
if 'ReportDateFilterType' in app_content and 'import { ReportDateFilterType' not in app_content:
    app_content = app_content.replace(
        "import { ShiftSchedule, StudioItem } from './types';",
        "import { ShiftSchedule, StudioItem, ReportDateFilterType } from './types';"
    )
    with open('src/App.tsx', 'w') as f:
        f.write(app_content)

# 3. Add import to other files with missing ReportDateFilterType
files_with_missing_type = [
    'src/shared/utils/engagementReporting.ts',
    'src/shared/utils/skuReporting.ts',
]
for file in files_with_missing_type:
    if os.path.exists(file):
        with open(file, 'r') as f:
            content = f.read()
        if 'import { ReportDateFilterType }' not in content:
            if "from '../../types'" in content:
                content = content.replace("from '../../types'", ", ReportDateFilterType } from '../../types'")
                content = content.replace("} ,", ",")
            else:
                content = "import { ReportDateFilterType } from '../../types';\n" + content
            with open(file, 'w') as f:
                f.write(content)

# Fix liveReportPanel ts issues:
liveReportPanel = 'src/shared/utils/liveReportPanel.ts'
if os.path.exists(liveReportPanel):
    with open(liveReportPanel, 'r') as f:
        content = f.read()
        content = content.replace("totalPeakViewersDb: v.peak_viewers_db || 0,", "totalPeakViewersDb: Number(v.peak_viewers_db) || 0,")
        content = content.replace("pTotalPeakViewersDb: pv.peak_viewers_db || 0,", "pTotalPeakViewersDb: Number(pv.peak_viewers_db) || 0,")
        content = content.replace("totalShopVouchersDb: v.shop_vouchers_db || 0,", "totalShopVouchersDb: Number(v.shop_vouchers_db) || 0,")
        content = content.replace("pTotalShopVouchersDb: pv.shop_vouchers_db || 0,", "pTotalShopVouchersDb: Number(pv.shop_vouchers_db) || 0,")
    with open(liveReportPanel, 'w') as f:
        f.write(content)


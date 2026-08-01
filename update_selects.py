with open('src/components/host/HostDashboard.tsx', 'r') as f:
    content = f.read()

import re

# Brand Replacement
brand_target = r'<select value=\{hostForm\.brand\}[\s\S]*?</select>'
brand_replacement = '''<CustomSelect 
                value={hostForm.brand} 
                onChange={(val: string) => { setHostFormError(""); setHostForm((prev: any) => ({ ...prev, brand: val })); }} 
                options={Array.from(new Set([hostForm.brand, ...(clientBrands?.length > 0 ? clientBrands.map((cb) => cb.name) : brands)].map(b => b?.trim()).filter(Boolean)))} 
                placeholder="-- Pilih Brand Besutan --" 
                error={hostFormError && !hostForm.brand} 
              />'''
content = re.sub(brand_target, brand_replacement, content)

# Platform Replacement
platform_target = r'<select value=\{hostForm\.platform\}[\s\S]*?</select>'
platform_replacement = '''<CustomSelect 
                value={hostForm.platform} 
                onChange={(val: string) => { setHostFormError(""); setHostForm((prev: any) => ({ ...prev, platform: val })); }} 
                options={platforms} 
                placeholder="-- Pilih Platform Streaming --" 
                error={hostFormError && !hostForm.platform} 
              />'''
content = re.sub(platform_target, platform_replacement, content)

# Shift Replacement
shift_target = r'<select value=\{hostForm\.shift\}[\s\S]*?</select>'
shift_replacement = '''<CustomSelect 
                value={hostForm.shift} 
                onChange={(val: string) => { setHostFormError(""); setHostForm((prev: any) => ({ ...prev, shift: val })); }} 
                options={shifts} 
                placeholder="-- Pilih Shift Kerja --" 
                error={hostFormError && !hostForm.shift} 
              />'''
content = re.sub(shift_target, shift_replacement, content)

# Studio Replacement
studio_target = r'<select value=\{hostForm\.studio\}[\s\S]*?</select>'
studio_replacement = '''<CustomSelect 
                value={hostForm.studio} 
                onChange={(val: string) => { setHostFormError(""); setHostForm((prev: any) => ({ ...prev, studio: val })); }} 
                options={studios.map(st => `${st.name} - ${st.location}`)} 
                placeholder="-- Pilih Studio Penempatan --" 
                error={hostFormError && !hostForm.studio} 
              />'''
content = re.sub(studio_target, studio_replacement, content)

with open('src/components/host/HostDashboard.tsx', 'w') as f:
    f.write(content)

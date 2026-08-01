with open('src/components/host/HostDashboard.tsx', 'r') as f:
    content = f.read()

import re

old_custom_select = '''function CustomSelect({ value, options, onChange, placeholder, error }: any) {'''
new_custom_select = '''function CustomSelect({ value, options, onChange, placeholder, error }: any) {
  // normalize options to {value, label} format
  const normalizedOptions = options.map((opt: any) => typeof opt === 'string' ? { value: opt, label: opt } : opt);'''

if old_custom_select in content:
    content = content.replace(old_custom_select, new_custom_select)

content = content.replace('options.map((opt: string)', 'normalizedOptions.map((opt: any)')
content = content.replace('key={opt}', 'key={opt.value}')
content = content.replace('onChange(opt)', 'onChange(opt.value)')
content = content.replace('value === opt', 'value === opt.value')
content = content.replace('value === opt.value.value', 'value === opt.value')
content = content.replace('{opt}', '{opt.label}')

# Now fix the studio replacement to pass objects
old_studio_options = '''options={studios.map(st => `${st.name} - ${st.location}`)}'''
new_studio_options = '''options={studios.map(st => ({ value: st.name, label: `${st.name} - ${st.location}` }))}'''
content = content.replace(old_studio_options, new_studio_options)

with open('src/components/host/HostDashboard.tsx', 'w') as f:
    f.write(content)

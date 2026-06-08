"""Batch-add auxiliary CSS tokens to all 9 theme blocks."""
import re

with open('src/styles/dark-theme.css', 'r', encoding='utf-8') as f:
    content = f.read()

AUX_TOKENS = """  --dark-status-success-bg: rgba(34, 197, 94, 0.10);
  --dark-status-warning-bg: rgba(245, 158, 11, 0.10);
  --dark-status-danger-bg: rgba(239, 68, 68, 0.10);
  --dark-status-info-bg: rgba(59, 130, 246, 0.10);
  --dark-shadow-elevated: 0 4px 12px rgba(0, 0, 0, 0.4);
  --dark-shadow-modal: 0 8px 24px rgba(0, 0, 0, 0.6);
  --dark-scrollbar-track: #1E293B;
  --dark-scrollbar-thumb: #475569;
  --dark-overlay-strong: rgba(0, 0, 0, 0.6);
  --dark-overlay-weak: rgba(0, 0, 0, 0.3);"""

AUX_TOKENS_LIGHT = """  --dark-status-success-bg: rgba(34, 197, 94, 0.08);
  --dark-status-warning-bg: rgba(245, 158, 11, 0.08);
  --dark-status-danger-bg: rgba(239, 68, 68, 0.08);
  --dark-status-info-bg: rgba(59, 130, 246, 0.08);
  --dark-shadow-elevated: 0 2px 8px rgba(0, 0, 0, 0.08);
  --dark-shadow-modal: 0 4px 16px rgba(0, 0, 0, 0.12);
  --dark-scrollbar-track: #F1F5F9;
  --dark-scrollbar-thumb: #94A3B8;
  --dark-overlay-strong: rgba(0, 0, 0, 0.4);
  --dark-overlay-weak: rgba(0, 0, 0, 0.15);"""

# For dark themes (7 themes after light): replace line after --dark-status-info-active
# Skip the default dark block (already done, line 133)
# Add after the other 7 dark themes (they have --dark-status-info-active at known lines)

pattern = r'(  --dark-status-info-active: #[0-9A-Fa-f]+;)\n'
lines_before = content.split('\n')

# Insert after each --dark-status-info-active in dark themes (skip default dark at index ~132 and light at ~40)
new_lines = []
dark_themes_seen = 0
for i, line in enumerate(lines_before):
    new_lines.append(line)
    if '--dark-status-info-active' in line:
        dark_themes_seen += 1
        # line 133 = default dark (already has tokens), line 41 = light
        if dark_themes_seen == 1:
            # light theme — already has these? Let me check if tokens already exist after this line
            next_line = lines_before[i+1] if i+1 < len(lines_before) else ''
            if '--dark-status-success-bg' not in next_line:
                new_lines.append(AUX_TOKENS_LIGHT)
        elif dark_themes_seen == 2:
            # default dark — already added
            pass
        else:
            # other dark themes
            next_line = lines_before[i+1] if i+1 < len(lines_before) else ''
            if '--dark-status-success-bg' not in next_line:
                new_lines.append(AUX_TOKENS)

result = '\n'.join(new_lines)

with open('src/styles/dark-theme.css', 'w', encoding='utf-8') as f:
    f.write(result)

print(f'Tokens added. Lines: {len(result.split(chr(10)))} (was {len(lines_before)})')

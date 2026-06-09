const fs = require('fs');
let code = fs.readFileSync('src/pages/CMS.tsx', 'utf8');

// 1. Add handleVideoUpload
code = code.replace(
  "  const handleImageUpload = (section: 'hero' | 'about' | 'features', e: React.ChangeEvent<HTMLInputElement>) => {",
  `  const handleVideoUpload = (section: 'hero', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setContent(prev => ({
          ...prev,
          [section]: { ...prev[section], backgroundVideo: reader.result as string }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = (section: 'hero' | 'about' | 'features', e: React.ChangeEvent<HTMLInputElement>) => {`
);

// 2. Add video preview to the Hero card
const heroPreviewCard = `                      {section === 'hero' && content.hero.backgroundVideo && (
                        <div className="mt-3 h-24 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 flex items-center justify-center">
                          <video src={content.hero.backgroundVideo} className="w-full h-full object-cover" controls muted />
                        </div>
                      )}
                      {content[section].imageUrl && (`;

code = code.replace(
  "                      {content[section].imageUrl && (",
  heroPreviewCard
);

// 3. Add video file input and preview to the Hero modal
// Replace the Background Video URL input with Background Video File input
code = code.replace(
  `                          <div>
                            <label className="block text-sm font-medium mb-2">Background Video URL</label>
                            <input
                              type="text"
                              value={content.hero.backgroundVideo || ''}
                              onChange={(e) => setContent({ ...content, hero: { ...content.hero, backgroundVideo: e.target.value } })}
                              className="input-field"
                              placeholder="https://..."
                            />
                          </div>`,
  `                          <div>
                            <label className="block text-sm font-medium mb-2">Background Video File</label>
                            <input
                              type="file"
                              accept="video/*"
                              onChange={(e) => handleVideoUpload('hero', e)}
                              className="input-field"
                            />
                          </div>
                          {content.hero.backgroundVideo && (
                            <div className="mt-3 mb-4">
                              <span className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Video Preview</span>
                              <div className="h-28 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 flex items-center justify-center relative group">
                                <video src={content.hero.backgroundVideo} className="w-full h-full object-cover" controls muted />
                              </div>
                            </div>
                          )}`
);

fs.writeFileSync('src/pages/CMS.tsx', code);
console.log("Updated CMS.tsx with video uploads and previews.");

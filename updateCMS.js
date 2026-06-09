const fs = require('fs');

const path = 'src/pages/CMS.tsx';
let code = fs.readFileSync(path, 'utf8');

// Add the editingSection state
code = code.replace(
  "const [savingSection, setSavingSection] = useState<'hero' | 'about' | 'features' | null>(null);",
  "const [savingSection, setSavingSection] = useState<'hero' | 'about' | 'features' | null>(null);\n  const [editingSection, setEditingSection] = useState<'hero' | 'about' | 'features' | null>(null);"
);

// Close the modal upon saving
code = code.replace(
  "alert(`${section.charAt(0).toUpperCase() + section.slice(1)} content saved successfully`);\n      fetchContent();",
  "alert(`${section.charAt(0).toUpperCase() + section.slice(1)} content saved successfully`);\n      fetchContent();\n      setEditingSection(null);"
);

const newContentRendering = `
      {/* Content Rendering */}
      {activeTab === 'content' ? (
        loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="space-y-6 max-h-[calc(100vh-14rem)] overflow-y-auto pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(['hero', 'about', 'features'] as const).map((section) => (
                <div key={section} className="card relative flex flex-col justify-between hover:shadow-lg hover:border-rose-500/20 group transition-all duration-300">
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-rose-500 transition-colors capitalize">
                        {section} Section
                      </h3>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-2 line-clamp-2">
                      <strong>Title:</strong> {content[section].title || 'Not set'}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 line-clamp-3">
                      <strong>Subtitle:</strong> {content[section].subtitle || 'Not set'}
                    </p>
                  </div>
                  <div className="border-t border-slate-100 dark:border-dark-border/20 pt-4 flex justify-end items-center gap-3">
                    <button
                      onClick={() => handleDeleteSection(section)}
                      className="py-2 px-4 text-sm inline-flex items-center text-white bg-red-500 hover:bg-red-600 rounded-xl transition-all duration-200 shadow-sm border-transparent"
                      title={\`Delete \${section} Section\`}
                    >
                      <Trash2 size={16} className="mr-2 inline" />
                      Delete
                    </button>
                    <button
                      onClick={() => setEditingSection(section)}
                      className="btn-primary py-2 px-4 text-sm inline-flex items-center"
                      title={\`Update \${section} Section\`}
                    >
                      <Edit2 size={16} className="mr-2 inline" />
                      Update
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Content Edit Form Modal */}
            {editingSection && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                  <div className="p-6 max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center gap-2 mb-6">
                      <FileText className="text-rose-500" size={18} />
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white capitalize">
                        Update {editingSection} Section
                      </h2>
                    </div>
                    <div className="space-y-4">
                      {editingSection === 'hero' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium mb-2">Hero Title</label>
                            <input
                              type="text"
                              value={content.hero.title}
                              onChange={(e) => setContent({ ...content, hero: { ...content.hero, title: e.target.value } })}
                              className="input-field"
                              placeholder="Main headline"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Hero Subtitle</label>
                            <textarea
                              rows={3}
                              value={content.hero.subtitle}
                              onChange={(e) => setContent({ ...content, hero: { ...content.hero, subtitle: e.target.value } })}
                              className="input-field"
                              placeholder="Subtitle text"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Trust Text</label>
                            <input
                              type="text"
                              value={content.hero.trustText || ''}
                              onChange={(e) => setContent({ ...content, hero: { ...content.hero, trustText: e.target.value } })}
                              className="input-field"
                              placeholder="100,000+ Independent artists trust us globally"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Button 1 Text</label>
                              <input
                                type="text"
                                value={content.hero.button1Text || ''}
                                onChange={(e) => setContent({ ...content, hero: { ...content.hero, button1Text: e.target.value } })}
                                className="input-field"
                                placeholder="Sign Up Now"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Button 1 Link</label>
                              <input
                                type="text"
                                value={content.hero.button1Link || ''}
                                onChange={(e) => setContent({ ...content, hero: { ...content.hero, button1Link: e.target.value } })}
                                className="input-field"
                                placeholder="/signup"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Button 2 Text</label>
                              <input
                                type="text"
                                value={content.hero.button2Text || ''}
                                onChange={(e) => setContent({ ...content, hero: { ...content.hero, button2Text: e.target.value } })}
                                className="input-field"
                                placeholder="Explore Features"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Button 2 Link</label>
                              <input
                                type="text"
                                value={content.hero.button2Link || ''}
                                onChange={(e) => setContent({ ...content, hero: { ...content.hero, button2Link: e.target.value } })}
                                className="input-field"
                                placeholder="/features"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Background Image URL</label>
                            <input
                              type="text"
                              value={content.hero.backgroundImage || ''}
                              onChange={(e) => setContent({ ...content, hero: { ...content.hero, backgroundImage: e.target.value } })}
                              className="input-field"
                              placeholder="https://..."
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Background Video URL</label>
                            <input
                              type="text"
                              value={content.hero.backgroundVideo || ''}
                              onChange={(e) => setContent({ ...content, hero: { ...content.hero, backgroundVideo: e.target.value } })}
                              className="input-field"
                              placeholder="https://..."
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Hero Image (Foreground/Fallback)</label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload('hero', e)}
                              className="input-field"
                            />
                          </div>
                          {content.hero.imageUrl && (
                            <div className="mt-3">
                              <span className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Banner Image Preview</span>
                              <div className="h-28 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 flex items-center justify-center relative group">
                                <img src={content.hero.imageUrl} alt="Hero Banner Preview" className="w-full h-full object-cover" />
                              </div>
                            </div>
                          )}
                        </>
                      )}
                      
                      {editingSection === 'about' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium mb-2">About Title</label>
                            <input
                              type="text"
                              value={content.about.title}
                              onChange={(e) => setContent({ ...content, about: { ...content.about, title: e.target.value } })}
                              className="input-field"
                              placeholder="About headline"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">About Subtitle / Description</label>
                            <textarea
                              rows={4}
                              value={content.about.subtitle}
                              onChange={(e) => setContent({ ...content, about: { ...content.about, subtitle: e.target.value } })}
                              className="input-field"
                              placeholder="About description text"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">About Image</label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload('about', e)}
                              className="input-field"
                            />
                          </div>
                          {content.about.imageUrl && (
                            <div className="mt-3">
                              <span className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">About Image Preview</span>
                              <div className="h-28 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 flex items-center justify-center relative group">
                                <img src={content.about.imageUrl} alt="About Image Preview" className="w-full h-full object-cover" />
                              </div>
                            </div>
                          )}
                        </>
                      )}
                      
                      {editingSection === 'features' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium mb-2">Features Title</label>
                            <input
                              type="text"
                              value={content.features.title}
                              onChange={(e) => setContent({ ...content, features: { ...content.features, title: e.target.value } })}
                              className="input-field"
                              placeholder="Features headline"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Features Subtitle / List (comma-separated)</label>
                            <textarea
                              rows={3}
                              value={content.features.subtitle}
                              onChange={(e) => setContent({ ...content, features: { ...content.features, subtitle: e.target.value } })}
                              className="input-field"
                              placeholder="Feature 1, Feature 2, Feature 3"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Features Banner Image</label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload('features', e)}
                              className="input-field"
                            />
                          </div>
                          {content.features.imageUrl && (
                            <div className="mt-3">
                              <span className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Features Image Preview</span>
                              <div className="h-28 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 flex items-center justify-center relative group">
                                <img src={content.features.imageUrl} alt="Features Image Preview" className="w-full h-full object-cover" />
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800 mt-6">
                      <button
                        type="button"
                        onClick={() => setEditingSection(null)}
                        className="btn-outline py-2 px-4"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={() => handleSaveContent(editingSection)}
                        disabled={savingSection === editingSection}
                        className="btn-primary py-2 px-4 inline-flex items-center"
                      >
                        <Save size={16} className="mr-2 inline" />
                        {savingSection === editingSection ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      ) : (`;

const startIndex = code.indexOf('{/* Content Rendering */}');
const endIndex = code.indexOf('/* Pricing tab rendering */');

if (startIndex === -1 || endIndex === -1) {
  console.error("Could not find the bounds to replace");
  process.exit(1);
}

// We need to match up to `) : (` which is right before the Pricing tab rendering comment
const strToReplace = code.substring(startIndex, endIndex);

// We replace the substring from startIndex to `) : (`.
// Let's find `) : (` before endIndex
const lastParenIndex = code.lastIndexOf(') : (', endIndex);

if (lastParenIndex === -1) {
  console.error("Could not find ) : (");
  process.exit(1);
}

const before = code.substring(0, startIndex);
const after = code.substring(lastParenIndex + 5);

const finalCode = before + newContentRendering + after;

fs.writeFileSync(path, finalCode);
console.log("Successfully replaced the content section rendering.");

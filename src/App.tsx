import { useState, useEffect, useRef } from 'react';
import { Layout } from './components/Layout';
import { A4Page } from './components/A4Page';
import { TextBox, type TextBoxData } from './components/TextBox';
import {
  Plus,
  Trash2,
  Type,
  Download,
  FileJson,
  Save,
  Upload,
  Image,
  Pencil,
  Check,
} from 'lucide-react';
import {
  getAllProjects,
  upsertProject,
  deleteProjectFromDB,
  getSetting,
  setSetting,
  type Project,
} from './lib/db';

function App() {
  const [pages, setPages] = useState<string[]>(['page-1']);
  const [margin, setMargin] = useState<number | null>(5);
  const [textBoxes, setTextBoxes] = useState<TextBoxData[]>([]);
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null);
  const [imageMap, setImageMap] = useState<Record<string, string>>({});
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [contextMenu, setContextMenu] = useState<{
    pageId: string;
    x: number;
    y: number;
    relX: number;
    relY: number;
  } | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const skipDirtyCheck = useRef(true); // skip on initial mount / after load

  // Track unsaved changes
  useEffect(() => {
    if (skipDirtyCheck.current) {
      skipDirtyCheck.current = false;
      return;
    }
    setIsDirty(true);
  }, [pages, textBoxes, margin, imageMap]);

  // Project Management State
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [currentProjectName, setCurrentProjectName] = useState<string>('Untitled Project');
  const [isEditingName, setIsEditingName] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  /** Apply project data to state (no confirmation) */
  const applyProjectData = (project: Project) => {
    skipDirtyCheck.current = true;
    setIsDirty(false);
    setPages(project.data.pages);
    setMargin(project.data.margin);
    setTextBoxes(project.data.textBoxes);
    setImageMap(project.data.imageMap || {});
    setCurrentProjectId(project.id);
    setCurrentProjectName(project.name);
    setSelectedBoxId(null);
  };

  // Load all projects from IndexedDB and restore last visited project on mount
  useEffect(() => {
    const init = async () => {
      try {
        // One-time migration from localStorage
        const lsRaw = localStorage.getItem('markdown-layout-projects');
        if (lsRaw) {
          try {
            const lsProjects: Project[] = JSON.parse(lsRaw);
            if (Array.isArray(lsProjects) && lsProjects.length > 0) {
              const existing = await getAllProjects();
              const existingIds = new Set(existing.map((p) => p.id));
              for (const p of lsProjects) {
                if (!existingIds.has(p.id)) {
                  await upsertProject(p);
                }
              }
            }
          } catch {
            // ignore malformed localStorage data
          }
          localStorage.removeItem('markdown-layout-projects');
        }

        const allProjects = await getAllProjects();
        const sorted = allProjects.sort((a, b) => b.lastModified - a.lastModified);
        setProjects(sorted);

        const lastId = await getSetting('lastProjectId');
        if (lastId) {
          const last = sorted.find((p) => p.id === lastId);
          if (last) applyProjectData(last);
        }
      } catch (err) {
        console.error('Failed to load projects from IndexedDB', err);
      }
    };
    init();
  }, []);

  // Focus name input when editing starts
  useEffect(() => {
    if (isEditingName) {
      nameInputRef.current?.focus();
      nameInputRef.current?.select();
    }
  }, [isEditingName]);

  // Handle beforeprint/afterprint to set document title for PDF filename
  useEffect(() => {
    const originalTitle = document.title;

    const handleBeforePrint = () => {
      if (currentProjectName) {
        document.title = currentProjectName;
      }
    };

    const handleAfterPrint = () => {
      document.title = originalTitle;
    };

    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);

    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, [currentProjectName]);

  // Close context menu on any click or Escape
  useEffect(() => {
    if (!contextMenu) return;
    const close = () => setContextMenu(null);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('click', close);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', close);
      document.removeEventListener('keydown', onKey);
    };
  }, [contextMenu]);

  const saveProject = async () => {
    const name = currentProjectName.trim() || 'Untitled Project';
    const id = currentProjectId ?? crypto.randomUUID();

    const project: Project = {
      id,
      name,
      lastModified: Date.now(),
      data: { pages, margin, textBoxes, imageMap },
    };

    await upsertProject(project);
    await setSetting('lastProjectId', id);

    setCurrentProjectId(id);
    setCurrentProjectName(name);
    setIsDirty(false);
    setProjects((prev) => {
      const filtered = prev.filter((p) => p.id !== id);
      return [project, ...filtered];
    });
  };

  const loadProject = async (project: Project) => {
    if (!isDirty || confirm('Unsaved changes will be lost. Load project?')) {
      applyProjectData(project);
      await setSetting('lastProjectId', project.id);
    }
  };

  const deleteProject = async (projectId: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      await deleteProjectFromDB(projectId);
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      if (projectId === currentProjectId) {
        setCurrentProjectId(null);
      }
    }
  };

  const downloadProject = () => {
    const projectData = {
      pages,
      margin,
      textBoxes,
      imageMap,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentProjectName || 'project'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importProject = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const projectData = JSON.parse(content);

        // Basic validation
        if (Array.isArray(projectData.pages) && Array.isArray(projectData.textBoxes)) {
          if (!isDirty || confirm('Unsaved changes will be lost. Import project?')) {
            const allExisting = await getAllProjects();
            const baseName = file.name.replace('.json', '');
            let uniqueName = baseName;
            let counter = 1;

            // Find unique name
            while (allExisting.some((p) => p.name === uniqueName)) {
              uniqueName = `${baseName} ${counter}`;
              counter++;
            }

            const newProject: Project = {
              id: crypto.randomUUID(),
              name: uniqueName,
              lastModified: Date.now(),
              data: {
                pages: projectData.pages,
                margin: projectData.margin ?? 5,
                textBoxes: projectData.textBoxes,
                imageMap: projectData.imageMap || {},
              },
            };

            await upsertProject(newProject);
            await setSetting('lastProjectId', newProject.id);

            applyProjectData(newProject);
            setProjects((prev) => [newProject, ...prev]);
          }
        } else {
          alert('Invalid project file format');
        }
      } catch (error) {
        console.error(error);
        alert('Error reading file');
      }
    };
    reader.readAsText(file);
    // Reset input value so same file can be selected again
    event.target.value = '';
  };

  const addPage = () => {
    setPages((prev) => [...prev, `page-${Date.now()}`]);
  };

  const removePage = (id: string) => {
    if (pages.length > 1) {
      setPages((prev) => prev.filter((p) => p !== id));
      setTextBoxes((prev) => prev.filter((box) => box.pageId !== id));
    }
  };

  const addTextBox = (pageId: string, atX?: number, atY?: number) => {
    const newBox: TextBoxData = {
      id: `box-${Date.now()}`,
      pageId,
      content: 'Double click to edit.',
      x: atX ?? 50,
      y: atY ?? 50,
      width: 300,
      height: 200,
      fontSize: 8,
    };
    setTextBoxes((prev) => [...prev, newBox]);
    setSelectedBoxId(newBox.id);
  };

  const updateTextBox = (id: string, updates: Partial<TextBoxData>) => {
    setTextBoxes((prev) => prev.map((box) => (box.id === id ? { ...box, ...updates } : box)));
  };

  const deleteTextBox = (id: string) => {
    setTextBoxes((prev) => prev.filter((box) => box.id !== id));
    if (selectedBoxId === id) setSelectedBoxId(null);
  };

  const createNewProject = () => {
    if (!isDirty || confirm('Unsaved changes will be lost. Create new project?')) {
      skipDirtyCheck.current = true;
      setIsDirty(false);
      setPages(['page-1']);
      setMargin(5);
      setTextBoxes([]);
      setImageMap({});
      setCurrentProjectId(null);
      setCurrentProjectName('Untitled Project');
      setSelectedBoxId(null);
    }
  };

  const commitNameEdit = async () => {
    setIsEditingName(false);
    const trimmed = currentProjectName.trim();
    const name = trimmed || 'Untitled Project';
    if (!trimmed) setCurrentProjectName('Untitled Project');
    // If a project is already saved, update its name in IndexedDB live
    if (currentProjectId) {
      const updated: Project = {
        id: currentProjectId,
        name,
        lastModified: Date.now(),
        data: { pages, margin, textBoxes, imageMap },
      };
      await upsertProject(updated);
      setCurrentProjectName(name);
      setProjects((prev) =>
        prev.map((p) =>
          p.id === currentProjectId ? { ...p, name, lastModified: updated.lastModified } : p,
        ),
      );
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setImageMap((prev) => ({
          ...prev,
          [file.name]: dataUrl,
        }));
      };
      reader.readAsDataURL(file);
    });

    // Reset input value so same file can be selected again
    event.target.value = '';
  };

  const removeImage = (imageName: string) => {
    setImageMap((prev) => {
      const updated = { ...prev };
      delete updated[imageName];
      return updated;
    });
  };

  return (
    <Layout
      sidebar={
        <div className='px-6 py-5 flex flex-col gap-6 h-full overflow-y-auto custom-scrollbar'>
          {/* Editable Project Name */}
          <div className='-mb-3'>
            {isEditingName ? (
              <div className='flex items-center gap-2'>
                <input
                  ref={nameInputRef}
                  type='text'
                  value={currentProjectName}
                  onChange={(e) => setCurrentProjectName(e.target.value)}
                  onBlur={commitNameEdit}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitNameEdit();
                    if (e.key === 'Escape') setIsEditingName(false);
                  }}
                  className='flex-1 bg-slate-50 border border-blue-400 rounded-lg px-2 py-1 text-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500'
                  placeholder='Untitled Project'
                />
                <button
                  onMouseDown={(e) => {
                    e.preventDefault();
                    commitNameEdit();
                  }}
                  className='p-1 text-blue-600 hover:bg-blue-50 rounded cursor-pointer'>
                  <Check size={14} />
                </button>
              </div>
            ) : (
              <div className='flex items-center gap-2'>
                <h1
                  className='text-xl font-bold text-slate-800 tracking-tight truncate cursor-text flex-1'
                  title={currentProjectName}
                  onClick={() => setIsEditingName(true)}>
                  {currentProjectName || 'Untitled Project'}
                </h1>
                <button
                  onClick={() => setIsEditingName(true)}
                  className='p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded opacity-0 group-hover/name:opacity-100 transition-opacity cursor-pointer flex-shrink-0'>
                  <Pencil size={12} />
                </button>
              </div>
            )}
          </div>

          <div className='space-y-3'>
            <h2 className='text-xs font-bold text-slate-400 uppercase tracking-wider'>
              Document Settings
            </h2>

            <div className='space-y-1'>
              <label className='text-sm font-medium text-slate-600'>Page Margin (mm)</label>
              <div className='flex items-center gap-1'>
                <button
                  onClick={() => setMargin((prev) => (prev !== null && prev > 0 ? prev - 1 : 0))}
                  className='cursor-pointer px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500'>
                  -
                </button>
                <input
                  type='number'
                  value={margin ?? ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '') {
                      setMargin(null); // Allow the input to be empty
                    } else {
                      const numValue = Number(value);
                      if (!isNaN(numValue)) {
                        setMargin(Math.max(numValue, 0));
                      }
                    }
                  }}
                  className='w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
                />
                <button
                  onClick={() => setMargin((prev) => (prev !== null ? prev + 1 : 1))}
                  className='cursor-pointer px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500'>
                  +
                </button>
              </div>
            </div>

            <div className='grid grid-cols-2 gap-2 pt-2'>
              <button
                onClick={addPage}
                className='flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 py-2 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer shadow-sm active:scale-95 text-sm font-medium'>
                <Plus size={16} /> Add Page
              </button>

              <button
                onClick={() => window.print()}
                className='flex items-center justify-center gap-2 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-all cursor-pointer shadow-sm shadow-indigo-200 active:scale-95 text-sm font-medium'>
                <Download size={16} /> PDF
              </button>
            </div>
          </div>

          {/* Images Section */}
          <div className='space-y-3'>
            <h2 className='text-xs font-bold text-slate-400 uppercase tracking-wider'>Images</h2>
            <p className='text-xs text-slate-500'>
              Upload images and use{' '}
              <code className='bg-slate-100 px-1 rounded'>![[filename.png]]</code> in markdown
            </p>
            <label className='flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 py-2 rounded-lg transition-colors text-sm font-medium cursor-pointer'>
              <Image size={16} /> Upload Images
              <input
                ref={imageInputRef}
                type='file'
                accept='image/*'
                multiple
                onChange={handleImageUpload}
                className='hidden'
              />
            </label>

            {Object.keys(imageMap).length > 0 && (
              <div className='space-y-2 max-h-40 overflow-y-auto custom-scrollbar'>
                {Object.entries(imageMap).map(([name, dataUrl]) => (
                  <div
                    key={name}
                    className='flex items-center gap-2 p-2 bg-white border border-slate-200 rounded-lg group hover:bg-slate-50'>
                    <img src={dataUrl} alt={name} className='w-8 h-8 object-cover rounded' />
                    <span className='text-xs text-slate-600 truncate flex-1' title={name}>
                      {name}
                    </span>
                    <button
                      onClick={() => removeImage(name)}
                      className='p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100 cursor-pointer'
                      title='Remove'>
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className='mt-3 space-y-3'>
            <h2 className='text-xs font-bold text-slate-400 uppercase tracking-wider'>Project</h2>

            <div className='grid grid-cols-2 gap-2'>
              <button
                onClick={createNewProject}
                className='flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg transition-colors text-xs font-medium cursor-pointer'
                title='New Project'>
                <Plus size={14} /> New
              </button>
              <button
                onClick={saveProject}
                className='flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white py-2 rounded-lg transition-colors text-xs font-medium cursor-pointer'
                title='Save Project'>
                <Save size={14} /> Save
              </button>
            </div>

            <div className='grid grid-cols-2 gap-2'>
              <button
                onClick={downloadProject}
                className='flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 py-2 rounded-lg transition-colors text-xs font-medium cursor-pointer'
                title='Export JSON'>
                <Upload size={14} /> Export
              </button>
              <label className='flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 py-2 rounded-lg transition-colors text-xs font-medium cursor-pointer'>
                <Download size={14} /> Import
                <input type='file' accept='.json' onChange={importProject} className='hidden' />
              </label>
            </div>

            <div className='w-20 mx-auto border-t border-slate-200'></div>

            {projects.length > 0 && (
              <div className='flex-1 overflow-hidden flex flex-col'>
                <div className='flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar'>
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className={`flex items-center justify-between p-2.5 border rounded-lg group transition-all cursor-pointer ${
                        project.id === currentProjectId
                          ? 'bg-indigo-50 border-indigo-200 hover:border-indigo-300'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                      onClick={() => loadProject(project)}>
                      <div className='flex items-center gap-3 overflow-hidden'>
                        <div
                          className={`p-1.5 rounded-md ${project.id === currentProjectId ? 'bg-indigo-100 text-indigo-700' : 'bg-indigo-50 text-indigo-600'}`}>
                          <FileJson size={14} />
                        </div>
                        <div className='flex flex-col overflow-hidden'>
                          <span
                            className='text-sm font-medium text-slate-700 truncate'
                            title={project.name}>
                            {project.name}
                          </span>
                          <span className='text-[10px] text-slate-400'>
                            {new Date(project.lastModified).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className='flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteProject(project.id);
                          }}
                          className='p-1.5 cursor-pointer hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-md transition-colors'
                          title='Delete'>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      }>
      {pages.map((id, index) => (
        <div className='w-full group' key={id}>
          <div
            className='relative w-max mx-auto not-last:print:break-after-page'
            onClick={() => setSelectedBoxId(null)}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const rect = e.currentTarget.getBoundingClientRect();
              const marginPx = (margin ?? 5) * (96 / 25.4);
              const relX = Math.max(0, e.clientX - rect.left - marginPx);
              const relY = Math.max(0, e.clientY - rect.top - marginPx);
              setContextMenu({ pageId: id, x: e.clientX, y: e.clientY, relX, relY });
            }}>
            <A4Page margin={margin ?? 5}>
              {/* Text Boxes for this page */}
              {textBoxes
                .filter((box) => box.pageId === id)
                .map((box) => (
                  <TextBox
                    key={box.id}
                    data={box}
                    isSelected={selectedBoxId === box.id}
                    onSelect={setSelectedBoxId}
                    onUpdate={updateTextBox}
                    onDelete={deleteTextBox}
                    imageMap={imageMap}
                  />
                ))}

              {/* Content Placeholder / Drop Zone Visual */}
              <div className='absolute top-0 left-0 w-full h-full pointer-events-none border border-dashed border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity print:hidden' />
            </A4Page>

            {/* Page Controls */}
            <div className='absolute top-2 right-[-50px] flex flex-col gap-2 print:hidden opacity-0 group-hover:opacity-100 transition-opacity'>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  addTextBox(id);
                }}
                className='p-2 bg-white rounded-full cursor-pointer shadow text-blue-600 hover:bg-blue-50'
                title='Add Text Box'>
                <Type size={20} />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removePage(id);
                }}
                className='p-2 bg-white rounded-full cursor-pointer shadow text-red-500 hover:bg-red-50'
                title='Remove Page'>
                <Trash2 size={20} />
              </button>
            </div>

            <div className='absolute top-2 left-[-40px] text-gray-400 font-medium print:hidden'>
              {index + 1}
            </div>
          </div>
        </div>
      ))}
      {/* Context Menu */}
      {contextMenu && (
        <div
          className='fixed z-50 bg-white border border-slate-200 rounded-lg shadow-lg py-1 min-w-40 print:hidden'
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}>
          <button
            className='w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer'
            onClick={() => {
              addTextBox(
                contextMenu.pageId,
                Math.max(0, contextMenu.relX - 150),
                Math.max(0, contextMenu.relY - 100),
              );
              setContextMenu(null);
            }}>
            <Type size={14} />
            Add Text Box
          </button>
        </div>
      )}
    </Layout>
  );
}

export default App;

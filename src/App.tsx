import { useState, useEffect, useRef } from 'react';
import { Layout } from './components/Layout';
import { A4Page } from './components/A4Page';
import { TextBox, type TextBoxData } from './components/TextBox';
import { Plus, Trash2, Type, Download, FileJson, Save, Upload, Image } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  lastModified: number;
  data: {
    pages: string[];
    margin: number | null;
    textBoxes: TextBoxData[];
    imageMap?: Record<string, string>;
  };
}

function App() {
  const [pages, setPages] = useState<string[]>(['page-1']);
  const [margin, setMargin] = useState<number | null>(5);
  const [textBoxes, setTextBoxes] = useState<TextBoxData[]>([]);
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null);
  const [imageMap, setImageMap] = useState<Record<string, string>>({});
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Project Management State
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('markdown-layout-projects');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentProjectName, setCurrentProjectName] = useState<string>('');

  useEffect(() => {
    localStorage.setItem('markdown-layout-projects', JSON.stringify(projects));
  }, [projects]);

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

  const saveProject = () => {
    const name = prompt(
      'Enter project name:',
      currentProjectName || `Project ${new Date().toLocaleDateString()}`
    );
    if (!name) return;

    const newProject: Project = {
      id:
        currentProjectName === name && projects.find((p) => p.name === name)
          ? projects.find((p) => p.name === name)!.id
          : crypto.randomUUID(),
      name,
      lastModified: Date.now(),
      data: {
        pages,
        margin,
        textBoxes,
        imageMap,
      },
    };

    setProjects((prev) => {
      const filtered = prev.filter((p) => p.name !== name);
      return [...filtered, newProject].sort((a, b) => b.lastModified - a.lastModified);
    });
    setCurrentProjectName(name);
  };

  const loadProject = (project: Project) => {
    if (confirm('Unsaved changes will be lost. Load project?')) {
      setPages(project.data.pages);
      setMargin(project.data.margin);
      setTextBoxes(project.data.textBoxes);
      setImageMap(project.data.imageMap || {});
      setCurrentProjectName(project.name);
      setSelectedBoxId(null);
    }
  };

  const deleteProject = (projectId: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      if (projects.find((p) => p.id === projectId)?.name === currentProjectName) {
        setCurrentProjectName('');
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

  const importProject = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const projectData = JSON.parse(content);

        // Basic validation
        if (Array.isArray(projectData.pages) && Array.isArray(projectData.textBoxes)) {
          if (confirm('Unsaved changes will be lost. Import project?')) {
            const baseName = file.name.replace('.json', '');
            let uniqueName = baseName;
            let counter = 1;

            // Find unique name
            while (projects.some((p) => p.name === uniqueName)) {
              uniqueName = `${baseName} ${counter}`;
              counter++;
            }

            setPages(projectData.pages);
            setMargin(projectData.margin || 5);
            setTextBoxes(projectData.textBoxes);
            setImageMap(projectData.imageMap || {});
            setCurrentProjectName(uniqueName);
            setSelectedBoxId(null);

            // Add to saved projects
            const newProject: Project = {
              id: crypto.randomUUID(),
              name: uniqueName,
              lastModified: Date.now(),
              data: {
                pages: projectData.pages,
                margin: projectData.margin || 5,
                textBoxes: projectData.textBoxes,
                imageMap: projectData.imageMap || {},
              },
            };

            setProjects((prev) => {
              return [...prev, newProject].sort((a, b) => b.lastModified - a.lastModified);
            });
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

  const addTextBox = (pageId: string) => {
    const newBox: TextBoxData = {
      id: `box-${Date.now()}`,
      pageId,
      content: 'Double click to edit.',
      x: 50,
      y: 50,
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
    if (confirm('Unsaved changes will be lost. Create new project?')) {
      setPages(['page-1']);
      setMargin(5);
      setTextBoxes([]);
      setImageMap({});
      setCurrentProjectName('');
      setSelectedBoxId(null);
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
          <div>
            <h1 className='text-xl font-bold text-slate-800 tracking-tight'>Cheatsheet Creator</h1>
            <p className='text-xs text-slate-500'>Use Markdown!</p>
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

          <div className='mt-3 pt-6 space-y-3'>
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
          </div>

          <div className='w-20 mx-auto border-t border-slate-200'></div>

          {projects.length > 0 && (
            <div className='flex-1 overflow-hidden flex flex-col'>
              {/* <h2 className='text-xs font-bold text-slate-400 uppercase tracking-wider mb-3'>
                Saved
              </h2> */}
              <div className='flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar'>
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className='flex items-center justify-between p-2.5 bg-white border border-slate-200 hover:border-slate-300 rounded-lg group hover:bg-slate-50 transition-all cursor-pointer'
                    onClick={() => loadProject(project)}>
                    <div className='flex items-center gap-3 overflow-hidden'>
                      <div className='p-1.5 bg-indigo-50 text-indigo-600 rounded-md'>
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
      }>
      {pages.map((id, index) => (
        <div className='w-full group' key={id}>
          <div
            className='relative w-max mx-auto not-last:print:break-after-page'
            onClick={() => setSelectedBoxId(null)}>
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
    </Layout>
  );
}

export default App;

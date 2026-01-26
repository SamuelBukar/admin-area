import { useState, useCallback, useEffect } from 'react';
import { FormElement, WidgetType } from '@/types/builder';
import { getWidgetConfig } from '@/config/widgets';
import { WidgetSidebar } from './WidgetSidebar';
import { BuilderCanvas } from './BuilderCanvas';
import { BuilderHeader } from './BuilderHeader';
import { useSaveTemplate } from '@/hooks/useQueries';
import { toast } from 'sonner';

interface FormBuilderProps {
  pageId?: string;
  initialElements?: FormElement[];
}

export const FormBuilder = ({ pageId, initialElements }: FormBuilderProps) => {
  const [elements, setElements] = useState<FormElement[]>(initialElements || []);
  const [isDragOver, setIsDragOver] = useState(false);
  const saveTemplate = useSaveTemplate();

  useEffect(() => {
    if (initialElements) {
      setElements(initialElements);
    }
  }, [initialElements]);

  // Helper function to find element by ID recursively
  const findElementById = useCallback((elements: FormElement[], id: string): FormElement | null => {
    for (const el of elements) {
      if (el.id === id) return el;
      if (el.type === 'CONTAINER' && typeof el.content === 'object' && 'children' in el.content) {
        const found = findElementById(el.content.children, id);
        if (found) return found;
      }
      if (el.type === 'GRID' && typeof el.content === 'object' && 'children' in el.content) {
        for (const column of el.content.children) {
          const found = findElementById(column, id);
          if (found) return found;
        }
      }
    }
    return null;
  }, []);

  // Handle drag start from sidebar
  const handleDragStart = useCallback((e: React.DragEvent, widgetType: WidgetType) => {
    e.dataTransfer.setData('widgetType', widgetType);
    e.dataTransfer.effectAllowed = 'copy';
  }, []);

  // Handle drop on canvas
  const handleDrop = useCallback((e: React.DragEvent, dropIndex?: number) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const widgetType = e.dataTransfer.getData('widgetType') as WidgetType;
    const draggedElementId = e.dataTransfer.getData('elementId') || e.dataTransfer.getData('text/plain');

    // If dragging an existing element (reordering)
    if (draggedElementId) {
      const draggedElement = findElementById(elements, draggedElementId);
      if (!draggedElement) return;

      // Remove the element from its current position
      const removeElement = (elements: FormElement[]): { elements: FormElement[]; found: boolean } => {
        const filtered = elements.filter(el => el.id !== draggedElementId);
        if (filtered.length !== elements.length) {
          return { elements: filtered, found: true };
        }

        // Recursively check containers and grids
        const updated = elements.map(el => {
          if (el.type === 'CONTAINER' && typeof el.content === 'object' && 'children' in el.content) {
            const result = removeElement(el.content.children);
            if (result.found) {
              return {
                ...el,
                content: {
                  ...el.content,
                  children: result.elements
                }
              };
            }
          }
          if (el.type === 'GRID' && typeof el.content === 'object' && 'children' in el.content) {
            let found = false;
            const newChildren = el.content.children.map(column => {
              const result = removeElement(column);
              if (result.found) found = true;
              return result.elements;
            });
            if (found) {
              return {
                ...el,
                content: {
                  ...el.content,
                  children: newChildren
                }
              };
            }
          }
          return el;
        });

        return { elements: updated, found: false };
      };

      const { elements: elementsWithoutDragged } = removeElement(elements);

      // Insert at the new position
      if (dropIndex !== undefined && dropIndex >= 0) {
        const newElements = [...elementsWithoutDragged];
        newElements.splice(dropIndex, 0, draggedElement);
        setElements(newElements);
        toast.success('Element moved');
      } else {
        // Add to end if no specific index
        setElements([...elementsWithoutDragged, draggedElement]);
        toast.success('Element moved');
      }
      return;
    }

    // If dragging a new widget from sidebar
    if (!widgetType) return;

    const config = getWidgetConfig(widgetType);
    if (!config) return;

    const newElement: FormElement = {
      id: crypto.randomUUID(),
      type: widgetType,
      content: JSON.parse(JSON.stringify(config.defaultContent)),
    };

    if (dropIndex !== undefined && dropIndex >= 0) {
      const newElements = [...elements];
      newElements.splice(dropIndex, 0, newElement);
      setElements(newElements);
    } else {
      setElements((prev) => [...prev, newElement]);
    }
    toast.success(`${config.label} added to template`);
  }, [elements, findElementById]);

  // Handle drag over
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
  }, []);

  // Handle drag leave
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  // Delete element (recursive for nested elements)
  const handleDeleteElement = useCallback((id: string) => {
    const deleteRecursive = (elements: FormElement[]): FormElement[] => {
      return elements
        .filter((el) => el.id !== id)
        .map((el) => {
          // Check if it's a container
          if (el.type === 'CONTAINER' && typeof el.content === 'object' && 'children' in el.content) {
            return {
              ...el,
              content: {
                ...el.content,
                children: deleteRecursive(el.content.children)
              }
            };
          }
          // Check if it's a grid
          if (el.type === 'GRID' && typeof el.content === 'object' && 'children' in el.content) {
            return {
              ...el,
              content: {
                ...el.content,
                children: el.content.children.map(column => deleteRecursive(column))
              }
            };
          }
          return el;
        });
    };
    
    setElements(prev => deleteRecursive(prev));
    toast.success('Element removed');
  }, []);

  // Update element content
  const handleUpdateElement = useCallback((id: string, content: FormElement['content'], styles?: Record<string, string>) => {
    const updateRecursive = (elements: FormElement[]): FormElement[] => {
      return elements.map((el) => {
        if (el.id === id) {
          return { ...el, content, styles: styles !== undefined ? styles : el.styles };
        }
        // Check if it's a container
        if (el.type === 'CONTAINER' && typeof el.content === 'object' && 'children' in el.content) {
          return {
            ...el,
            content: {
              ...el.content,
              children: updateRecursive(el.content.children)
            }
          };
        }
        // Check if it's a grid
        if (el.type === 'GRID' && typeof el.content === 'object' && 'children' in el.content) {
          return {
            ...el,
            content: {
              ...el.content,
              children: el.content.children.map(column => updateRecursive(column))
            }
          };
        }
        return el;
      });
    };
    
    setElements(prev => updateRecursive(prev));
  }, []);

  // Handle drop into container or grid column
  const handleDropInContainer = useCallback((containerId: string, columnIndex: number, widgetType: WidgetType) => {
    const config = getWidgetConfig(widgetType);
    if (!config) return;

    const newElement: FormElement = {
      id: crypto.randomUUID(),
      type: widgetType,
      content: JSON.parse(JSON.stringify(config.defaultContent)),
    };

    const addToContainer = (elements: FormElement[]): FormElement[] => {
      return elements.map((el) => {
        if (el.id === containerId) {
          // Handle CONTAINER drop (columnIndex === -1)
          if (el.type === 'CONTAINER' && typeof el.content === 'object' && 'children' in el.content && columnIndex === -1) {
            return {
              ...el,
              content: {
                ...el.content,
                children: [...el.content.children, newElement]
              }
            };
          }
          // Handle GRID column drop
          if (el.type === 'GRID' && typeof el.content === 'object' && 'children' in el.content && columnIndex >= 0) {
            const newChildren = [...el.content.children];
            if (newChildren[columnIndex]) {
              newChildren[columnIndex] = [...newChildren[columnIndex], newElement];
            }
            return {
              ...el,
              content: {
                ...el.content,
                children: newChildren
              }
            };
          }
        }
        // Recursively check children
        if (el.type === 'CONTAINER' && typeof el.content === 'object' && 'children' in el.content) {
          return {
            ...el,
            content: {
              ...el.content,
              children: addToContainer(el.content.children)
            }
          };
        }
        if (el.type === 'GRID' && typeof el.content === 'object' && 'children' in el.content) {
          return {
            ...el,
            content: {
              ...el.content,
              children: el.content.children.map(column => addToContainer(column))
            }
          };
        }
        return el;
      });
    };

    setElements(prev => addToContainer(prev));
    const targetName = columnIndex === -1 ? 'container' : `column ${columnIndex + 1}`;
    toast.success(`${config.label} added to ${targetName}`);
  }, []);

  // Save draft - auto-saves as template to Pages
  const handleSave = useCallback(() => {
    if (elements.length === 0) {
      toast.error('Please add at least one element to save a template');
      return;
    }
    
    // Get current user ID
    const savedUser = localStorage.getItem('landadmin-user');
    const userId = savedUser ? JSON.parse(savedUser).id : undefined;
    
    // Save template using mutation hook (which will invalidate queries)
    saveTemplate.mutate(
      { elements, userId },
      {
        onSuccess: () => {
          // Also store in localStorage for draft recovery
          const draftData = {
            elements,
            lastModified: new Date().toISOString(),
          };
          localStorage.setItem('landadmin-draft', JSON.stringify(draftData));
          toast.success('Template saved! You can now use it in Create Forms.');
        },
        onError: () => {
          toast.error('Failed to save template');
        },
      }
    );
  }, [elements, saveTemplate]);

  // Print / Export PDF
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // Clear all elements
  const handleClear = useCallback(() => {
    if (elements.length === 0) return;
    
    setElements([]);
    toast.success('Template cleared');
  }, [elements.length]);

  return (
    <div className="flex flex-col h-full bg-background">
      <BuilderHeader
        elementCount={elements.length}
        elements={elements}
        pageId={pageId}
        onSave={handleSave}
        onPrint={handlePrint}
        onClear={handleClear}
        isSaving={saveTemplate.isPending}
      />

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        <WidgetSidebar onDragStart={handleDragStart} />
        
        <BuilderCanvas
          elements={elements}
          isDragOver={isDragOver}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDeleteElement={handleDeleteElement}
          onUpdateElement={handleUpdateElement}
          onDropInContainer={handleDropInContainer}
          onMoveElement={handleDrop}
        />
      </div>
    </div>
  );
};

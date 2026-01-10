import { FormElement, WidgetType } from '@/types/builder';
import { ElementRenderer } from './ElementRenderer';
import { MdAddCircleOutline } from 'react-icons/md';
import { useState } from 'react';

interface BuilderCanvasProps {
  elements: FormElement[];
  isDragOver: boolean;
  onDrop: (e: React.DragEvent, dropIndex?: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDeleteElement: (id: string) => void;
  onUpdateElement: (id: string, content: FormElement['content']) => void;
  onDropInContainer?: (containerId: string, columnIndex: number, widgetType: string) => void;
  onMoveElement?: (e: React.DragEvent, dropIndex?: number) => void;
}

export const BuilderCanvas = ({
  elements,
  isDragOver,
  onDrop,
  onDragOver,
  onDragLeave,
  onDeleteElement,
  onUpdateElement,
  onDropInContainer,
  onMoveElement,
}: BuilderCanvasProps) => {
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  return (
    <div className="flex-1 bg-canvas p-4 lg:p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        {/* Document container */}
        <div
          className={`
            min-h-[calc(100vh-12rem)] bg-card rounded-xl shadow-widget p-6 lg:p-10
            border-2 transition-all duration-200
            ${isDragOver ? 'border-primary border-dashed bg-primary/5' : 'border-transparent'}
          `}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
        >
          {elements.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 animate-pulse-subtle">
                <MdAddCircleOutline className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Start Building Your Template
              </h3>
              <p className="text-muted-foreground max-w-md">
                Drag and drop widgets from the sidebar to create your document or form template.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {elements.map((element, index) => (
                <div key={element.id} className="relative">
                  {/* Drop zone before element */}
                  <div
                    className={`transition-all duration-200 ${
                      dragOverIndex === index
                        ? 'h-8 -mb-2 bg-primary/20 border-2 border-dashed border-primary rounded flex items-center justify-center'
                        : 'h-2 -mb-2 hover:h-4 hover:bg-primary/5'
                    }`}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDragOverIndex(null);
                      if (onMoveElement) {
                        onMoveElement(e, index);
                      } else {
                        onDrop(e, index);
                      }
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      // Check if dragging (effectAllowed is set) - getData doesn't work in dragOver
                      const isDragging = e.dataTransfer.effectAllowed !== 'none' && e.dataTransfer.effectAllowed !== 'uninitialized';
                      if (isDragging) {
                        setDragOverIndex(index);
                        e.dataTransfer.dropEffect = e.dataTransfer.effectAllowed === 'move' ? 'move' : 'copy';
                      }
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                        setDragOverIndex(null);
                      }
                    }}
                  >
                    {dragOverIndex === index && (
                      <span className="text-xs font-medium text-primary">Drop here</span>
                    )}
                  </div>
                  <ElementRenderer
                    element={element}
                    onDelete={onDeleteElement}
                    onUpdate={onUpdateElement}
                    onDropInContainer={onDropInContainer}
                    onMoveElement={onMoveElement}
                  />
                </div>
              ))}

              {/* Drop zone at the end */}
              <div
                className={`transition-all duration-200 ${
                  dragOverIndex === elements.length
                    ? 'h-8 bg-primary/20 border-2 border-dashed border-primary rounded flex items-center justify-center'
                    : 'h-2 hover:h-4 hover:bg-primary/5'
                }`}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDragOverIndex(null);
                  if (onMoveElement) {
                    onMoveElement(e, elements.length);
                  } else {
                    onDrop(e, elements.length);
                  }
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Check if dragging (effectAllowed is set) - getData doesn't work in dragOver
                  const isDragging = e.dataTransfer.effectAllowed !== 'none' && e.dataTransfer.effectAllowed !== 'uninitialized';
                  if (isDragging) {
                    setDragOverIndex(elements.length);
                    e.dataTransfer.dropEffect = e.dataTransfer.effectAllowed === 'move' ? 'move' : 'copy';
                  }
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    setDragOverIndex(null);
                  }
                }}
              >
                {dragOverIndex === elements.length && (
                  <span className="text-xs font-medium text-primary">Drop here</span>
                )}
              </div>

              {/* Drop indicator at bottom for new widgets */}
              {isDragOver && dragOverIndex === null && (
                <div className="border-2 border-dashed border-primary rounded-lg p-6 flex items-center justify-center animate-fade-in">
                  <span className="text-sm font-medium text-primary">Drop here</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

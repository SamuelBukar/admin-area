import { FormElement, InputContent, SelectContent, RadioContent, CheckboxContent, GridContent, ContainerContent, SpaceContent, ImageContent, ButtonContent } from '@/types/builder';
import { MdClose, MdDragIndicator, MdEdit, MdAdd } from 'react-icons/md';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent as SelectDropdown, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { EditFormModal } from './EditFormModal';
import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from '@/lib/apiClient';
import { getApiUrl } from '@/config/env';
import { toast } from 'sonner';

interface ElementRendererProps {
  element: FormElement;
  onDelete: (id: string) => void;
  onUpdate: (id: string, content: FormElement['content'], styles?: Record<string, string>) => void;
  onDropInContainer?: (containerId: string, columnIndex: number, widgetType: string) => void;
  onMoveElement?: (e: React.DragEvent, dropIndex?: number) => void;
  parentId?: string;
}

export const ElementRenderer = ({ element, onDelete, onUpdate, onDropInContainer, onMoveElement, parentId }: ElementRendererProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [labelValue, setLabelValue] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [dragOverColumn, setDragOverColumn] = useState<number | null>(null);
  const [isDragOverContainer, setIsDragOverContainer] = useState(false);

  const handleDrop = (e: React.DragEvent, columnIndex?: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverColumn(null);
    setIsDragOverContainer(false);
    
    const widgetType = e.dataTransfer.getData('widgetType');
    const draggedElementId = e.dataTransfer.getData('elementId') || e.dataTransfer.getData('text/plain');
    
    // If moving an existing element, let parent handle it
    if (draggedElementId && onMoveElement) {
      // For now, we don't handle moving elements into containers
      // This would require more complex logic to handle nested moves
      return;
    }
    
    if (widgetType && onDropInContainer) {
      if (columnIndex !== undefined) {
        // Grid column drop
        onDropInContainer(element.id, columnIndex, widgetType);
      } else {
        // Container drop (use -1 to indicate container, not column)
        onDropInContainer(element.id, -1, widgetType);
      }
    }
  };

  // Handle drag start for existing elements
  const handleElementDragStart = (e: React.DragEvent) => {
    // Don't start drag if clicking directly on buttons or interactive elements
    const target = e.target as HTMLElement;
    
    // Check if the target or its parent is a button/input that should not trigger drag
    const isButton = target.tagName === 'BUTTON' || target.closest('button[draggable="false"]');
    const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT';
    const isInteractiveInput = target.closest('input:not([draggable]), textarea:not([draggable]), select:not([draggable])');
    
    if (isButton || isInput || isInteractiveInput) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    
    // Set drag data - use multiple formats for better browser compatibility
    e.dataTransfer.setData('elementId', element.id);
    e.dataTransfer.setData('text/plain', element.id);
    e.dataTransfer.effectAllowed = 'move';
    
    // Create a custom drag image (invisible)
    const dragImage = new Image();
    dragImage.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    e.dataTransfer.setDragImage(dragImage, 0, 0);
    
    // Add visual feedback
    e.currentTarget.classList.add('opacity-50');
  };

  const handleElementDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('opacity-50');
  };

  const handleDragOver = (e: React.DragEvent, columnIndex?: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (columnIndex !== undefined) {
      setDragOverColumn(columnIndex);
    } else {
      setIsDragOverContainer(true);
    }
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
    setIsDragOverContainer(false);
  };

  // Reset label editing state when element changes
  useEffect(() => {
    setIsEditingLabel(false);
    setLabelValue('');
  }, [element.id]);

  const getElementStyle = () => {
    if (!element.styles) return {};
    return element.styles;
  };

  const renderContent = () => {
    const elementStyle = getElementStyle();
    
    switch (element.type) {
      case 'TITLE':
        return isEditing ? (
          <Input
            value={element.content as string}
            onChange={(e) => onUpdate(element.id, e.target.value, element.styles)}
            onBlur={() => setIsEditing(false)}
            autoFocus
            className="text-2xl font-bold border-primary"
            style={elementStyle}
          />
        ) : (
          <h1 
            className="text-2xl font-bold text-foreground cursor-text"
            onClick={() => setIsEditing(true)}
            style={elementStyle}
          >
            {element.content as string}
          </h1>
        );

      case 'SUBTITLE':
        return isEditing ? (
          <Input
            value={element.content as string}
            onChange={(e) => onUpdate(element.id, e.target.value, element.styles)}
            onBlur={() => setIsEditing(false)}
            autoFocus
            className="text-lg font-semibold border-primary"
            style={elementStyle}
          />
        ) : (
          <h2 
            className="text-lg font-semibold text-foreground cursor-text"
            onClick={() => setIsEditing(true)}
            style={elementStyle}
          >
            {element.content as string}
          </h2>
        );

      case 'PARAGRAPH':
        return isEditing ? (
          <Textarea
            value={element.content as string}
            onChange={(e) => onUpdate(element.id, e.target.value, element.styles)}
            onBlur={() => setIsEditing(false)}
            autoFocus
            className="border-primary resize-none"
            rows={3}
            style={elementStyle}
          />
        ) : (
          <p 
            className="text-foreground leading-relaxed cursor-text"
            onClick={() => setIsEditing(true)}
            style={elementStyle}
          >
            {element.content as string}
          </p>
        );

      case 'DIVIDER': {
        const dividerStyle: React.CSSProperties = {
          borderTopWidth: element.styles?.borderWidth || '2px',
          borderTopStyle: (element.styles?.borderStyle as React.CSSProperties['borderTopStyle']) || 'solid',
          borderTopColor: element.styles?.borderColor || undefined,
          margin: element.styles?.margin || undefined,
          ...elementStyle,
        };
        return <hr style={dividerStyle} className="my-2" />;
      }

      case 'SPACE': {
        const spaceContent = element.content as SpaceContent;
        return (
          <div 
            style={{ height: `${spaceContent.height}px` }}
            className="bg-muted/20 border-2 border-dashed border-muted rounded flex items-center justify-center group/space"
          >
            {isEditing ? (
              <Input
                type="number"
                value={spaceContent.height}
                onChange={(e) => onUpdate(element.id, { height: parseInt(e.target.value) || 40 })}
                onBlur={() => setIsEditing(false)}
                autoFocus
                className="w-24 text-center"
                min="10"
                max="500"
              />
            ) : (
              <span 
                className="text-xs text-muted-foreground cursor-pointer"
                onClick={() => setIsEditing(true)}
              >
                {spaceContent.height}px (click to edit)
              </span>
            )}
          </div>
        );
      }

      case 'IMAGE': {
        const imageContent = element.content as ImageContent;
        const alignmentClass = imageContent.alignment === 'left' ? 'justify-start' : 
                              imageContent.alignment === 'right' ? 'justify-end' : 
                              'justify-center';
        
        return (
          <div className={`flex ${alignmentClass} w-full`} style={elementStyle}>
            <div className="relative group/image">
              {imageContent.url ? (
                <img
                  src={imageContent.url}
                  alt={imageContent.alt || 'Image'}
                  style={{
                    width: imageContent.width || '100%',
                    height: imageContent.height || 'auto',
                    maxWidth: '100%',
                    objectFit: 'contain',
                  }}
                  className="rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                  }}
                />
              ) : (
                <div className="w-full h-48 bg-muted/20 border-2 border-dashed border-muted rounded-lg flex items-center justify-center">
                  <span className="text-sm text-muted-foreground">No image URL provided</span>
                </div>
              )}
            </div>
          </div>
        );
      }

      case 'INPUT': {
        const inputContent = element.content as InputContent;
        const handleLabelClick = () => {
          setIsEditingLabel(true);
          setLabelValue(inputContent.label);
        };
        const handleLabelBlur = () => {
          setIsEditingLabel(false);
          if (labelValue !== inputContent.label) {
            onUpdate(element.id, { ...inputContent, label: labelValue }, element.styles);
          }
        };
        const handleLabelKeyDown = (e: React.KeyboardEvent) => {
          if (e.key === 'Enter') {
            handleLabelBlur();
          } else if (e.key === 'Escape') {
            setLabelValue(inputContent.label);
            setIsEditingLabel(false);
          }
        };
        return (
          <div className="space-y-2" style={elementStyle}>
            {isEditingLabel ? (
              <Input
                value={labelValue}
                onChange={(e) => setLabelValue(e.target.value)}
                onBlur={handleLabelBlur}
                onKeyDown={handleLabelKeyDown}
                autoFocus
                className="text-sm font-medium border-primary h-7"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <Label 
                className="text-sm font-medium text-foreground cursor-text hover:bg-accent/50 px-1 py-0.5 rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  handleLabelClick();
                }}
              >
                {inputContent.label}
                {inputContent.required && <span className="text-destructive ml-1">*</span>}
              </Label>
            )}
            <Input 
              placeholder={inputContent.placeholder}
              className="print:border-0 print:border-b print:border-dotted print:rounded-none"
            />
          </div>
        );
      }

      case 'TEXTAREA': {
        const textareaContent = element.content as InputContent;
        const handleLabelClick = () => {
          setIsEditingLabel(true);
          setLabelValue(textareaContent.label);
        };
        const handleLabelBlur = () => {
          setIsEditingLabel(false);
          if (labelValue !== textareaContent.label) {
            onUpdate(element.id, { ...textareaContent, label: labelValue }, element.styles);
          }
        };
        const handleLabelKeyDown = (e: React.KeyboardEvent) => {
          if (e.key === 'Enter') {
            handleLabelBlur();
          } else if (e.key === 'Escape') {
            setLabelValue(textareaContent.label);
            setIsEditingLabel(false);
          }
        };
        return (
          <div className="space-y-2" style={elementStyle}>
            {isEditingLabel ? (
              <Input
                value={labelValue}
                onChange={(e) => setLabelValue(e.target.value)}
                onBlur={handleLabelBlur}
                onKeyDown={handleLabelKeyDown}
                autoFocus
                className="text-sm font-medium border-primary h-7"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <Label 
                className="text-sm font-medium text-foreground cursor-text hover:bg-accent/50 px-1 py-0.5 rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  handleLabelClick();
                }}
              >
                {textareaContent.label}
                {textareaContent.required && <span className="text-destructive ml-1">*</span>}
              </Label>
            )}
            <Textarea 
              placeholder={textareaContent.placeholder}
              className="resize-none print:border-0 print:border-b print:border-dotted print:rounded-none"
              rows={4}
            />
          </div>
        );
      }

      case 'CHECKBOX': {
        const checkboxContent = element.content as CheckboxContent;
        const handleLabelClick = () => {
          setIsEditingLabel(true);
          setLabelValue(checkboxContent.label);
        };
        const handleLabelBlur = () => {
          setIsEditingLabel(false);
          if (labelValue !== checkboxContent.label) {
            onUpdate(element.id, { ...checkboxContent, label: labelValue }, element.styles);
          }
        };
        const handleLabelKeyDown = (e: React.KeyboardEvent) => {
          if (e.key === 'Enter') {
            handleLabelBlur();
          } else if (e.key === 'Escape') {
            setLabelValue(checkboxContent.label);
            setIsEditingLabel(false);
          }
        };
        return (
          <div className="flex items-center space-x-3" style={elementStyle}>
            <Checkbox id={element.id} />
            {isEditingLabel ? (
              <Input
                value={labelValue}
                onChange={(e) => setLabelValue(e.target.value)}
                onBlur={handleLabelBlur}
                onKeyDown={handleLabelKeyDown}
                autoFocus
                className="text-sm border-primary h-7 flex-1"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <Label 
                htmlFor={element.id} 
                className="text-sm text-foreground cursor-text hover:bg-accent/50 px-1 py-0.5 rounded flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  handleLabelClick();
                }}
              >
                {checkboxContent.label}
              </Label>
            )}
          </div>
        );
      }

      case 'RADIO': {
        const radioContent = element.content as RadioContent;
        const handleLabelClick = () => {
          setIsEditingLabel(true);
          setLabelValue(radioContent.label);
        };
        const handleLabelBlur = () => {
          setIsEditingLabel(false);
          if (labelValue !== radioContent.label) {
            onUpdate(element.id, { ...radioContent, label: labelValue }, element.styles);
          }
        };
        const handleLabelKeyDown = (e: React.KeyboardEvent) => {
          if (e.key === 'Enter') {
            handleLabelBlur();
          } else if (e.key === 'Escape') {
            setLabelValue(radioContent.label);
            setIsEditingLabel(false);
          }
        };
        return (
          <div className="space-y-3" style={elementStyle}>
            {isEditingLabel ? (
              <Input
                value={labelValue}
                onChange={(e) => setLabelValue(e.target.value)}
                onBlur={handleLabelBlur}
                onKeyDown={handleLabelKeyDown}
                autoFocus
                className="text-sm font-medium border-primary h-7"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <Label 
                className="text-sm font-medium text-foreground cursor-text hover:bg-accent/50 px-1 py-0.5 rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  handleLabelClick();
                }}
              >
                {radioContent.label}
                {radioContent.required && <span className="text-destructive ml-1">*</span>}
              </Label>
            )}
            <RadioGroup>
              {radioContent.options.map((option, idx) => (
                <div key={idx} className="flex items-center space-x-3">
                  <RadioGroupItem value={option} id={`${element.id}-${idx}`} />
                  <Label htmlFor={`${element.id}-${idx}`} className="text-sm text-foreground cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );
      }

      case 'SELECT': {
        const selectContent = element.content as SelectContent;
        const handleLabelClick = () => {
          setIsEditingLabel(true);
          setLabelValue(selectContent.label);
        };
        const handleLabelBlur = () => {
          setIsEditingLabel(false);
          if (labelValue !== selectContent.label) {
            onUpdate(element.id, { ...selectContent, label: labelValue }, element.styles);
          }
        };
        const handleLabelKeyDown = (e: React.KeyboardEvent) => {
          if (e.key === 'Enter') {
            handleLabelBlur();
          } else if (e.key === 'Escape') {
            setLabelValue(selectContent.label);
            setIsEditingLabel(false);
          }
        };
        return (
          <div className="space-y-2" style={elementStyle}>
            {isEditingLabel ? (
              <Input
                value={labelValue}
                onChange={(e) => setLabelValue(e.target.value)}
                onBlur={handleLabelBlur}
                onKeyDown={handleLabelKeyDown}
                autoFocus
                className="text-sm font-medium border-primary h-7"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <Label 
                className="text-sm font-medium text-foreground cursor-text hover:bg-accent/50 px-1 py-0.5 rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  handleLabelClick();
                }}
              >
                {selectContent.label}
                {selectContent.required && <span className="text-destructive ml-1">*</span>}
              </Label>
            )}
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectDropdown>
                {selectContent.options.map((option, idx) => (
                  <SelectItem key={idx} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectDropdown>
            </Select>
          </div>
        );
      }

      case 'DATE': {
        const dateContent = element.content as InputContent;
        const handleLabelClick = () => {
          setIsEditingLabel(true);
          setLabelValue(dateContent.label);
        };
        const handleLabelBlur = () => {
          setIsEditingLabel(false);
          if (labelValue !== dateContent.label) {
            onUpdate(element.id, { ...dateContent, label: labelValue }, element.styles);
          }
        };
        const handleLabelKeyDown = (e: React.KeyboardEvent) => {
          if (e.key === 'Enter') {
            handleLabelBlur();
          } else if (e.key === 'Escape') {
            setLabelValue(dateContent.label);
            setIsEditingLabel(false);
          }
        };
        return (
          <div className="space-y-2" style={elementStyle}>
            {isEditingLabel ? (
              <Input
                value={labelValue}
                onChange={(e) => setLabelValue(e.target.value)}
                onBlur={handleLabelBlur}
                onKeyDown={handleLabelKeyDown}
                autoFocus
                className="text-sm font-medium border-primary h-7"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <Label 
                className="text-sm font-medium text-foreground cursor-text hover:bg-accent/50 px-1 py-0.5 rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  handleLabelClick();
                }}
              >
                {dateContent.label}
                {dateContent.required && <span className="text-destructive ml-1">*</span>}
              </Label>
            )}
            <Input 
              type="date"
              className="print:border-0 print:border-b print:border-dotted print:rounded-none"
            />
          </div>
        );
      }

      case 'BUTTON': {
        const buttonContent = element.content as ButtonContent;
        const handleLabelClick = () => {
          setIsEditingLabel(true);
          setLabelValue(buttonContent.label);
        };
        const handleLabelBlur = () => {
          setIsEditingLabel(false);
          if (labelValue !== buttonContent.label) {
            onUpdate(element.id, { ...buttonContent, label: labelValue }, element.styles);
          }
        };
        const handleLabelKeyDown = (e: React.KeyboardEvent) => {
          if (e.key === 'Enter') {
            handleLabelBlur();
          } else if (e.key === 'Escape') {
            setLabelValue(buttonContent.label);
            setIsEditingLabel(false);
          }
        };
        const handleButtonClick = async () => {
          if (buttonContent.actionType === 'link') {
            if (buttonContent.link) {
              if (buttonContent.openInNewTab) {
                window.open(buttonContent.link, '_blank', 'noopener,noreferrer');
              } else {
                window.location.href = buttonContent.link;
              }
            }
          } else if (buttonContent.actionType === 'api') {
            if (buttonContent.apiEndpoint) {
              try {
                const method = buttonContent.apiMethod || 'GET';
                let body = null;
                
                if (buttonContent.apiBody) {
                  try {
                    body = JSON.parse(buttonContent.apiBody);
                  } catch {
                    body = buttonContent.apiBody;
                  }
                }

                // Use the configured API URL if available
                const endpoint = getApiUrl(buttonContent.apiEndpoint) || buttonContent.apiEndpoint;

                let response;
                switch (method) {
                  case 'GET':
                    response = await apiGet(endpoint);
                    break;
                  case 'POST':
                    response = await apiPost(endpoint, body);
                    break;
                  case 'PUT':
                    response = await apiPut(endpoint, body);
                    break;
                  case 'PATCH':
                    response = await apiPatch(endpoint, body);
                    break;
                  case 'DELETE':
                    response = await apiDelete(endpoint);
                    break;
                  default:
                    response = await apiGet(endpoint);
                }

                toast.success('API call successful', {
                  description: method === 'GET' ? 'Data retrieved' : 'Action completed',
                });
                console.log('API Response:', response);
              } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : 'An error occurred';
                toast.error('API call failed', {
                  description: errorMessage,
                });
                console.error('API Error:', error);
              }
            }
          }
        };

        return (
          <div className="space-y-2" style={elementStyle}>
            {isEditingLabel ? (
              <Input
                value={labelValue}
                onChange={(e) => setLabelValue(e.target.value)}
                onBlur={handleLabelBlur}
                onKeyDown={handleLabelKeyDown}
                autoFocus
                className="text-sm border-primary h-9"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isEditingLabel) {
                    handleButtonClick();
                  }
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  handleLabelClick();
                }}
                className="print:border print:border-gray-400 print:bg-transparent print:text-black cursor-pointer"
              >
                {buttonContent.label}
              </Button>
            )}
          </div>
        );
      }

      case 'CONTAINER': {
        const containerContent = element.content as ContainerContent;
        return (
          <div 
            className={`border-2 border-dashed rounded-lg p-4 transition-colors ${
              isDragOverContainer 
                ? 'border-primary bg-primary/5' 
                : 'border-muted'
            }`}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleDrop(e);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleDragOver(e);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleDragLeave();
            }}
          >
            {isEditing ? (
              <Input
                value={containerContent.title || ''}
                onChange={(e) => onUpdate(element.id, { ...containerContent, title: e.target.value })}
                onBlur={() => setIsEditing(false)}
                autoFocus
                className="font-semibold mb-4"
                placeholder="Container Title"
              />
            ) : (
              containerContent.title && (
                <h3 
                  className="font-semibold mb-4 cursor-text"
                  onClick={() => setIsEditing(true)}
                >
                  {containerContent.title}
                </h3>
              )
            )}
            
            <div className="space-y-4 min-h-[60px]">
              {containerContent.children.length === 0 ? (
                <div className={`flex items-center justify-center py-8 text-sm transition-colors ${
                  isDragOverContainer 
                    ? 'text-primary' 
                    : 'text-muted-foreground'
                }`}>
                  <MdAdd className="w-5 h-5 mr-2" />
                  Drop widgets here
                </div>
              ) : (
                containerContent.children.map((child) => (
                  <ElementRenderer
                    key={child.id}
                    element={child}
                    onDelete={onDelete}
                    onUpdate={onUpdate}
                    onDropInContainer={onDropInContainer}
                    onMoveElement={onMoveElement}
                    parentId={element.id}
                  />
                ))
              )}
            </div>
          </div>
        );
      }

      case 'GRID': {
        const gridContent = element.content as GridContent;
        return (
          <div 
            className={`grid gap-4`}
            style={{ gridTemplateColumns: `repeat(${gridContent.columns}, 1fr)` }}
          >
            {gridContent.children.map((columnChildren, columnIndex) => (
              <div
                key={columnIndex}
                className={`min-h-[100px] border-2 border-dashed rounded-lg p-3 transition-colors ${
                  dragOverColumn === columnIndex 
                    ? 'border-primary bg-primary/5' 
                    : 'border-muted'
                }`}
                onDrop={(e) => handleDrop(e, columnIndex)}
                onDragOver={(e) => handleDragOver(e, columnIndex)}
                onDragLeave={handleDragLeave}
              >
                {columnChildren.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                    Drop here
                  </div>
                ) : (
                  <div className="space-y-3">
                    {columnChildren.map((child) => (
                      <ElementRenderer
                        key={child.id}
                        element={child}
                        onDelete={onDelete}
                        onUpdate={onUpdate}
                        onDropInContainer={onDropInContainer}
                        onMoveElement={onMoveElement}
                        parentId={element.id}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      }

      default:
        return <p className="text-muted-foreground">Unknown element type</p>;
    }
  };

  // All elements should have edit modals
  const canEdit = [
    'INPUT', 'TEXTAREA', 'CHECKBOX', 'RADIO', 'SELECT', 'DATE', 'IMAGE', 'BUTTON',
    'TITLE', 'SUBTITLE', 'PARAGRAPH', 'DIVIDER', 'GRID', 'CONTAINER', 'SPACE'
  ].includes(element.type);
  const canInlineEdit = ['TITLE', 'SUBTITLE', 'PARAGRAPH', 'CONTAINER', 'SPACE'].includes(element.type);

  return (
    <>
      <div 
        className="element-container animate-scale-in group cursor-move"
        draggable={true}
        onDragStart={handleElementDragStart}
        onDragEnd={handleElementDragEnd}
        style={{ userSelect: 'none' }}
      >
        {/* Control bar */}
        <div className="flex items-center justify-between mb-3 opacity-0 group-hover:opacity-100 transition-opacity no-print">
          <div className="flex items-center gap-2">
            <MdDragIndicator className="w-5 h-5 text-muted-foreground cursor-grab active:cursor-grabbing" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {element.type}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {(canEdit || canInlineEdit) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (canEdit) {
                    setEditModalOpen(true);
                  } else {
                    setIsEditing(true);
                  }
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
                draggable={false}
                className="p-1.5 rounded-md hover:bg-muted transition-colors"
              >
                <MdEdit className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(element.id);
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
              draggable={false}
              className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors"
            >
              <MdClose className="w-4 h-4 text-destructive" />
            </button>
          </div>
        </div>

        {/* Content */}
        {renderContent()}
      </div>

      {/* Edit Modal for Form Elements */}
      {canEdit && (
        <EditFormModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          elementType={element.type}
          content={element.content}
          element={element}
          onSave={(newContent, newStyles) => onUpdate(element.id, newContent, newStyles)}
        />
      )}
    </>
  );
};

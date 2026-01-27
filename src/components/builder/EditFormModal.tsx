import { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { MdUpload, MdImage as MdImageIcon } from 'react-icons/md';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent as SelectDropdown, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import type { 
  InputContent, 
  SelectContent, 
  RadioContent, 
  CheckboxContent, 
  FormElement, 
  ElementContent, 
  ImageContent, 
  ButtonContent, 
  GridContent, 
  ContainerContent, 
  SpaceContent,
  NameContent,
  AddressContent,
  PhoneContent,
  NumberContent,
  NigeriaStateContent,
  NigeriaCityContent,
  CountryContent,
  PassportImageContent,
} from '@/types/builder';

interface EditFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  elementType: string;
  content: ElementContent;
  element?: FormElement;
  onSave: (content: ElementContent, styles?: Record<string, string>) => void;
}

export const EditFormModal = ({ open, onOpenChange, elementType, content, element, onSave }: EditFormModalProps) => {
  // For DIVIDER, content is not used, so we can use empty string
  const initialContent = elementType === 'DIVIDER' ? '' : content;
  const [formData, setFormData] = useState(initialContent);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [styles, setStyles] = useState<Record<string, string>>(element?.styles || {
    color: '',
    backgroundColor: '',
    fontSize: '',
    fontWeight: '',
    fontFamily: '',
    padding: '',
    margin: '',
  });

  // Reset form data when content changes (e.g., editing different element)
  useEffect(() => {
    if (open) {
      const newContent = elementType === 'DIVIDER' ? '' : content;
      setFormData(newContent);
      setStyles(element?.styles || {
        color: '',
        backgroundColor: '',
        fontSize: '',
        fontWeight: '',
        fontFamily: '',
        padding: '',
        margin: '',
      });
    }
  }, [open, content, element, elementType]);

  const handleSave = () => {
    const cleanStyles = Object.fromEntries(
      Object.entries(styles).filter(([_, value]) => value !== '')
    );
    // For DIVIDER, we don't save content, only styles
    const contentToSave = elementType === 'DIVIDER' ? '' : formData;
    onSave(contentToSave, Object.keys(cleanStyles).length > 0 ? cleanStyles : undefined);
    onOpenChange(false);
  };

  const renderFields = () => {
    switch (elementType) {
      case 'INPUT':
      case 'TEXTAREA':
      case 'DATE': {
        const data = formData as InputContent;
        return (
          <>
            <div className="space-y-2">
              <Label>Field Label</Label>
              <Input
                value={data.label}
                onChange={(e) => setFormData({ ...data, label: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Placeholder</Label>
              <Input
                value={data.placeholder}
                onChange={(e) => setFormData({ ...data, placeholder: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={data.required || false}
                onCheckedChange={(checked) => setFormData({ ...data, required: checked })}
              />
              <Label>Required Field</Label>
            </div>
          </>
        );
      }

      case 'NUMBER': {
        const data = formData as NumberContent;
        return (
          <>
            <div className="space-y-2">
              <Label>Field Label</Label>
              <Input
                value={data.label}
                onChange={(e) => setFormData({ ...data, label: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Placeholder</Label>
              <Input
                value={data.placeholder}
                onChange={(e) => setFormData({ ...data, placeholder: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={data.required || false}
                onCheckedChange={(checked) => setFormData({ ...data, required: checked })}
              />
              <Label>Required Field</Label>
            </div>
          </>
        );
      }

      case 'PHONE':
      case 'ADDRESS': {
        const data = formData as PhoneContent | AddressContent;
        return (
          <>
            <div className="space-y-2">
              <Label>Field Label</Label>
              <Input
                value={data.label}
                onChange={(e) => setFormData({ ...data, label: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Placeholder</Label>
              <Input
                value={data.placeholder}
                onChange={(e) => setFormData({ ...data, placeholder: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={data.required || false}
                onCheckedChange={(checked) => setFormData({ ...data, required: checked })}
              />
              <Label>Required Field</Label>
            </div>
          </>
        );
      }

      case 'CHECKBOX': {
        const data = formData as CheckboxContent;
        return (
          <div className="space-y-2">
            <Label>Label</Label>
            <Input
              value={data.label}
              onChange={(e) => setFormData({ ...data, label: e.target.value })}
            />
          </div>
        );
      }

      case 'SELECT':
      case 'RADIO': {
        const data = formData as SelectContent | RadioContent;
        return (
          <>
            <div className="space-y-2">
              <Label>Field Label</Label>
              <Input
                value={data.label}
                onChange={(e) => setFormData({ ...data, label: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Options (one per line)</Label>
              <Textarea
                value={data.options.join('\n')}
                onChange={(e) => setFormData({ ...data, options: e.target.value.split('\n').filter(o => o.trim()) })}
                rows={5}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={data.required || false}
                onCheckedChange={(checked) => setFormData({ ...data, required: checked })}
              />
              <Label>Required Field</Label>
            </div>
          </>
        );
      }

      case 'NIGERIA_STATE': {
        const data = formData as NigeriaStateContent;
        return (
          <>
            <div className="space-y-2">
              <Label>Field Label</Label>
              <Input
                value={data.label}
                onChange={(e) => setFormData({ ...data, label: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={data.required || false}
                onCheckedChange={(checked) => setFormData({ ...data, required: checked })}
              />
              <Label>Required Field</Label>
            </div>
          </>
        );
      }

      case 'NIGERIA_CITY': {
        const data = formData as NigeriaCityContent;
        return (
          <>
            <div className="space-y-2">
              <Label>Field Label</Label>
              <Input
                value={data.label}
                onChange={(e) => setFormData({ ...data, label: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={data.required || false}
                onCheckedChange={(checked) => setFormData({ ...data, required: checked })}
              />
              <Label>Required Field</Label>
            </div>
          </>
        );
      }

      case 'COUNTRY': {
        const data = formData as CountryContent;
        return (
          <>
            <div className="space-y-2">
              <Label>Field Label</Label>
              <Input
                value={data.label}
                onChange={(e) => setFormData({ ...data, label: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Options (one per line)</Label>
              <Textarea
                value={(data.options || ['Nigeria']).join('\n')}
                onChange={(e) =>
                  setFormData({
                    ...data,
                    options: e.target.value.split('\n').filter((o) => o.trim()),
                  })
                }
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Default is Nigeria. Add more countries if you want this form to support other locations.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={data.required || false}
                onCheckedChange={(checked) => setFormData({ ...data, required: checked })}
              />
              <Label>Required Field</Label>
            </div>
          </>
        );
      }

      case 'NAME': {
        const data = formData as NameContent;
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Group Label</Label>
              <Input
                value={data.label}
                onChange={(e) => setFormData({ ...data, label: e.target.value })}
                placeholder="Full Name"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>First Name Label</Label>
                <Input
                  value={data.firstNameLabel}
                  onChange={(e) => setFormData({ ...data, firstNameLabel: e.target.value })}
                  placeholder="First Name"
                />
                <div className="flex items-center space-x-2 mt-1">
                  <Switch
                    checked={data.firstRequired ?? true}
                    onCheckedChange={(checked) => setFormData({ ...data, firstRequired: checked })}
                  />
                  <Label>Required</Label>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Middle Name Label</Label>
                <Input
                  value={data.middleNameLabel}
                  onChange={(e) => setFormData({ ...data, middleNameLabel: e.target.value })}
                  placeholder="Middle Name (Optional)"
                />
              </div>
              <div className="space-y-2">
                <Label>Last Name Label</Label>
                <Input
                  value={data.lastNameLabel}
                  onChange={(e) => setFormData({ ...data, lastNameLabel: e.target.value })}
                  placeholder="Last Name"
                />
                <div className="flex items-center space-x-2 mt-1">
                  <Switch
                    checked={data.lastRequired ?? true}
                    onCheckedChange={(checked) => setFormData({ ...data, lastRequired: checked })}
                  />
                  <Label>Required</Label>
                </div>
              </div>
            </div>
          </div>
        );
      }

      case 'PASSPORT_IMAGE': {
        const data = formData as PassportImageContent;
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Field Label</Label>
              <Input
                value={data.label}
                onChange={(e) => setFormData({ ...data, label: e.target.value })}
                placeholder="Passport Photograph"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={data.required || false}
                onCheckedChange={(checked) => setFormData({ ...data, required: checked })}
              />
              <Label>Required Field</Label>
            </div>
            <p className="text-xs text-muted-foreground">
              The actual upload happens when users fill the application form. Here you control the label and whether it is required.
            </p>
          </div>
        );
      }

      case 'BUTTON': {
        const data = formData as ButtonContent;
        return (
          <>
            <div className="space-y-2">
              <Label>Button Label</Label>
              <Input
                value={data.label}
                onChange={(e) => setFormData({ ...data, label: e.target.value })}
                placeholder="Click Me"
              />
            </div>
            <div className="space-y-2">
              <Label>Action Type</Label>
              <Select 
                value={data.actionType || 'link'} 
                onValueChange={(value: 'link' | 'api') => {
                  const newData: ButtonContent = {
                    ...data,
                    actionType: value,
                    link: value === 'link' ? (data.link || 'https://example.com') : undefined,
                    apiEndpoint: value === 'api' ? (data.apiEndpoint || '/api/endpoint') : undefined,
                    apiMethod: value === 'api' ? (data.apiMethod || 'GET') : undefined,
                  };
                  setFormData(newData);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectDropdown>
                  <SelectItem value="link">Link (Navigate to URL)</SelectItem>
                  <SelectItem value="api">API Call</SelectItem>
                </SelectDropdown>
              </Select>
            </div>

            {data.actionType === 'link' ? (
              <>
                <div className="space-y-2">
                  <Label>URL</Label>
                  <Input
                    value={data.link || ''}
                    onChange={(e) => setFormData({ ...data, link: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={data.openInNewTab || false}
                    onCheckedChange={(checked) => setFormData({ ...data, openInNewTab: checked })}
                  />
                  <Label>Open in New Tab</Label>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>API Endpoint</Label>
                  <Input
                    value={data.apiEndpoint || ''}
                    onChange={(e) => setFormData({ ...data, apiEndpoint: e.target.value })}
                    placeholder="/api/users or https://api.example.com/users"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the API endpoint. If VITE_API_URL is set, relative paths will use it as base URL.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>HTTP Method</Label>
                  <Select 
                    value={data.apiMethod || 'GET'} 
                    onValueChange={(value: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE') => 
                      setFormData({ ...data, apiMethod: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectDropdown>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="PATCH">PATCH</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                    </SelectDropdown>
                  </Select>
                </div>
                {(data.apiMethod === 'POST' || data.apiMethod === 'PUT' || data.apiMethod === 'PATCH') && (
                  <div className="space-y-2">
                    <Label>Request Body (JSON, optional)</Label>
                    <Textarea
                      value={data.apiBody || ''}
                      onChange={(e) => setFormData({ ...data, apiBody: e.target.value })}
                      placeholder='{"key": "value"}'
                      rows={4}
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter JSON data for the request body. Leave empty for no body.
                    </p>
                  </div>
                )}
              </>
            )}
          </>
        );
      }

      case 'IMAGE': {
        const data = formData as ImageContent;
        const isDataUrl = data.url?.startsWith('data:image/');
        
        const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
          const file = e.target.files?.[0];
          if (!file) return;

          // Validate file type
          if (!file.type.startsWith('image/')) {
            toast.error('Please select a valid image file');
            return;
          }

          // Validate file size (max 5MB)
          const maxSize = 5 * 1024 * 1024; // 5MB
          if (file.size > maxSize) {
            toast.error('Image size must be less than 5MB');
            return;
          }

          setIsUploading(true);
          
          try {
            // Convert file to base64 data URL
            const reader = new FileReader();
            reader.onload = (event) => {
              const dataUrl = event.target?.result as string;
              setFormData({ ...data, url: dataUrl });
              toast.success('Image uploaded successfully');
              setIsUploading(false);
            };
            reader.onerror = () => {
              toast.error('Failed to read image file');
              setIsUploading(false);
            };
            reader.readAsDataURL(file);
          } catch (error) {
            toast.error('Failed to upload image');
            setIsUploading(false);
          }
        };

        return (
          <>
            <div className="space-y-2">
              <Label>Image Source</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex-1"
                >
                  <MdUpload className="w-4 h-4 mr-2" />
                  {isUploading ? 'Uploading...' : 'Upload from Computer'}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
              {isDataUrl && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MdImageIcon className="w-3 h-3" />
                  Image uploaded from your computer
                </p>
              )}
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input
                value={data.url || ''}
                onChange={(e) => setFormData({ ...data, url: e.target.value })}
                placeholder="https://example.com/image.jpg or upload from computer"
              />
              <p className="text-xs text-muted-foreground">
                Enter a valid image URL or upload an image from your computer
              </p>
            </div>
            <div className="space-y-2">
              <Label>Alt Text</Label>
              <Input
                value={data.alt || ''}
                onChange={(e) => setFormData({ ...data, alt: e.target.value })}
                placeholder="Image description for accessibility"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Width</Label>
                <Input
                  value={data.width || ''}
                  onChange={(e) => setFormData({ ...data, width: e.target.value })}
                  placeholder="100% or 300px"
                />
              </div>
              <div className="space-y-2">
                <Label>Height</Label>
                <Input
                  value={data.height || ''}
                  onChange={(e) => setFormData({ ...data, height: e.target.value })}
                  placeholder="auto or 200px"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Alignment</Label>
              <Select 
                value={data.alignment || 'center'} 
                onValueChange={(value: 'left' | 'center' | 'right') => setFormData({ ...data, alignment: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectDropdown>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectDropdown>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Preview</Label>
                {data.url && isDataUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setFormData({ ...data, url: '' })}
                    className="text-xs"
                  >
                    Remove Image
                  </Button>
                )}
              </div>
              <div className="border rounded-lg p-4 bg-muted/20 min-h-[200px] flex items-center justify-center">
                {data.url ? (
                  <img
                    key={data.url} // Force re-render when URL changes
                    src={data.url}
                    alt={data.alt || 'Preview'}
                    className="max-w-full max-h-[400px] h-auto rounded object-contain"
                    style={{
                      width: data.width && data.width !== 'auto' ? data.width : 'auto',
                      height: data.height && data.height !== 'auto' ? data.height : 'auto',
                      maxWidth: '100%',
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      const errorDiv = document.createElement('div');
                      errorDiv.className = 'text-sm text-destructive text-center p-4';
                      errorDiv.textContent = 'Failed to load image. Please check the URL or try uploading again.';
                      target.parentElement?.replaceChild(errorDiv, target);
                    }}
                    onLoad={() => {
                      // Image loaded successfully
                      console.log('Preview image loaded successfully');
                    }}
                  />
                ) : (
                  <div className="text-center text-muted-foreground">
                    <MdImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No image to preview</p>
                    <p className="text-xs mt-1">Upload an image or enter a URL above</p>
                  </div>
                )}
              </div>
              {data.url && isDataUrl && (
                <p className="text-xs text-muted-foreground">
                  Note: Uploaded images are embedded as base64 data. For better performance with large images, consider using an image hosting service.
                </p>
              )}
            </div>
          </>
        );
      }

      case 'TITLE':
      case 'SUBTITLE':
      case 'PARAGRAPH': {
        const textContent = formData as string;
        return (
          <div className="space-y-2">
            <Label>Text Content</Label>
            {elementType === 'PARAGRAPH' ? (
              <Textarea
                value={textContent || ''}
                onChange={(e) => setFormData(e.target.value)}
                rows={5}
                placeholder="Enter your text here..."
              />
            ) : (
              <Input
                value={textContent || ''}
                onChange={(e) => setFormData(e.target.value)}
                placeholder="Enter your text here..."
              />
            )}
          </div>
        );
      }

      case 'DIVIDER': {
        // Divider doesn't have content, only styles
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Divider Style</Label>
              <Select 
                value={styles.borderStyle || 'solid'} 
                onValueChange={(value) => setStyles({ ...styles, borderStyle: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectDropdown>
                  <SelectItem value="solid">Solid</SelectItem>
                  <SelectItem value="dashed">Dashed</SelectItem>
                  <SelectItem value="dotted">Dotted</SelectItem>
                  <SelectItem value="double">Double</SelectItem>
                </SelectDropdown>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Thickness (px)</Label>
              <Input
                type="number"
                value={styles.borderWidth?.replace('px', '') || '2'}
                onChange={(e) => setStyles({ ...styles, borderWidth: e.target.value ? `${e.target.value}px` : '2px' })}
                min="1"
                max="10"
              />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={styles.borderColor || '#e5e7eb'}
                  onChange={(e) => setStyles({ ...styles, borderColor: e.target.value })}
                  className="w-16 h-10"
                />
                <Input
                  type="text"
                  placeholder="#e5e7eb"
                  value={styles.borderColor || ''}
                  onChange={(e) => setStyles({ ...styles, borderColor: e.target.value })}
                />
              </div>
            </div>
          </div>
        );
      }

      case 'GRID': {
        const data = formData as GridContent;
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Number of Columns</Label>
              <Select 
                value={data.columns.toString()} 
                onValueChange={(value) => {
                  const newColumns = parseInt(value);
                  // Adjust children arrays if needed
                  const newChildren: FormElement[][] = [];
                  for (let i = 0; i < newColumns; i++) {
                    newChildren[i] = data.children[i] || [];
                  }
                  setFormData({ ...data, columns: newColumns, children: newChildren });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectDropdown>
                  <SelectItem value="2">2 Columns</SelectItem>
                  <SelectItem value="3">3 Columns</SelectItem>
                  <SelectItem value="4">4 Columns</SelectItem>
                </SelectDropdown>
              </Select>
              <p className="text-xs text-muted-foreground">
                Note: Changing columns may affect existing content. Drag widgets into grid columns to add content.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Column Gap (px)</Label>
              <Input
                type="number"
                value={styles.gap?.replace('px', '') || '16'}
                onChange={(e) => setStyles({ ...styles, gap: e.target.value ? `${e.target.value}px` : '16px' })}
                min="0"
                max="50"
              />
            </div>
          </div>
        );
      }

      case 'CONTAINER': {
        const data = formData as ContainerContent;
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Container Title (Optional)</Label>
              <Input
                value={data.title || ''}
                onChange={(e) => setFormData({ ...data, title: e.target.value })}
                placeholder="Enter container title..."
              />
            </div>
            <div className="space-y-2">
              <Label>Background Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={styles.backgroundColor || '#ffffff'}
                  onChange={(e) => setStyles({ ...styles, backgroundColor: e.target.value })}
                  className="w-16 h-10"
                />
                <Input
                  type="text"
                  placeholder="#ffffff"
                  value={styles.backgroundColor || ''}
                  onChange={(e) => setStyles({ ...styles, backgroundColor: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Padding (px)</Label>
              <Input
                type="number"
                value={styles.padding?.replace('px', '') || '16'}
                onChange={(e) => setStyles({ ...styles, padding: e.target.value ? `${e.target.value}px` : '16px' })}
                min="0"
                max="100"
              />
            </div>
            <div className="space-y-2">
              <Label>Border Radius (px)</Label>
              <Input
                type="number"
                value={styles.borderRadius?.replace('px', '') || '8'}
                onChange={(e) => setStyles({ ...styles, borderRadius: e.target.value ? `${e.target.value}px` : '8px' })}
                min="0"
                max="50"
              />
            </div>
          </div>
        );
      }

      case 'SPACE': {
        const data = formData as SpaceContent;
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Height (px)</Label>
              <Input
                type="number"
                value={data.height || 40}
                onChange={(e) => setFormData({ ...data, height: parseInt(e.target.value) || 40 })}
                min="10"
                max="500"
              />
              <p className="text-xs text-muted-foreground">
                Vertical spacing between elements
              </p>
            </div>
            <div className="space-y-2">
              <Label>Background Color (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={styles.backgroundColor || '#f3f4f6'}
                  onChange={(e) => setStyles({ ...styles, backgroundColor: e.target.value })}
                  className="w-16 h-10"
                />
                <Input
                  type="text"
                  placeholder="#f3f4f6"
                  value={styles.backgroundColor || ''}
                  onChange={(e) => setStyles({ ...styles, backgroundColor: e.target.value })}
                />
              </div>
            </div>
          </div>
        );
      }

      default:
        return (
          <div className="text-center text-muted-foreground py-4">
            <p>No properties available for this element type.</p>
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit {elementType}</DialogTitle>
          <DialogDescription>
            Customize the properties and styling of this form field
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="properties" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="styling">Styling</TabsTrigger>
          </TabsList>
          
          <TabsContent value="properties" className="space-y-4 py-4">
            {renderFields()}
          </TabsContent>
          
          <TabsContent value="styling" className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="color">Text Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="color"
                    type="color"
                    value={styles.color || '#000000'}
                    onChange={(e) => setStyles({ ...styles, color: e.target.value })}
                    className="w-16 h-10"
                  />
                  <Input
                    type="text"
                    placeholder="#000000"
                    value={styles.color || ''}
                    onChange={(e) => setStyles({ ...styles, color: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="backgroundColor">Background Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="backgroundColor"
                    type="color"
                    value={styles.backgroundColor || '#ffffff'}
                    onChange={(e) => setStyles({ ...styles, backgroundColor: e.target.value })}
                    className="w-16 h-10"
                  />
                  <Input
                    type="text"
                    placeholder="#ffffff"
                    value={styles.backgroundColor || ''}
                    onChange={(e) => setStyles({ ...styles, backgroundColor: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fontSize">Font Size</Label>
                <Select 
                  value={styles.fontSize || ''} 
                  onValueChange={(value) => setStyles({ ...styles, fontSize: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Default" />
                  </SelectTrigger>
                  <SelectDropdown>
                    <SelectItem value="12px">12px</SelectItem>
                    <SelectItem value="14px">14px</SelectItem>
                    <SelectItem value="16px">16px</SelectItem>
                    <SelectItem value="18px">18px</SelectItem>
                    <SelectItem value="20px">20px</SelectItem>
                    <SelectItem value="24px">24px</SelectItem>
                    <SelectItem value="32px">32px</SelectItem>
                  </SelectDropdown>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fontWeight">Font Weight</Label>
                <Select 
                  value={styles.fontWeight || ''} 
                  onValueChange={(value) => setStyles({ ...styles, fontWeight: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Default" />
                  </SelectTrigger>
                  <SelectDropdown>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="500">Medium</SelectItem>
                    <SelectItem value="600">Semi Bold</SelectItem>
                    <SelectItem value="700">Bold</SelectItem>
                  </SelectDropdown>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fontFamily">Font Family</Label>
              <Select 
                value={styles.fontFamily || ''} 
                onValueChange={(value) => setStyles({ ...styles, fontFamily: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Default" />
                </SelectTrigger>
                  <SelectDropdown>
                    <SelectItem value="Arial, sans-serif">Arial</SelectItem>
                    <SelectItem value="Georgia, serif">Georgia</SelectItem>
                    <SelectItem value="'Times New Roman', serif">Times New Roman</SelectItem>
                    <SelectItem value="'Courier New', monospace">Courier New</SelectItem>
                    <SelectItem value="Verdana, sans-serif">Verdana</SelectItem>
                  </SelectDropdown>
              </Select>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="padding">Padding (px)</Label>
                <Input
                  id="padding"
                  type="number"
                  placeholder="0"
                  value={styles.padding?.replace('px', '') || ''}
                  onChange={(e) => setStyles({ ...styles, padding: e.target.value ? `${e.target.value}px` : '' })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="margin">Margin (px)</Label>
                <Input
                  id="margin"
                  type="number"
                  placeholder="0"
                  value={styles.margin?.replace('px', '') || ''}
                  onChange={(e) => setStyles({ ...styles, margin: e.target.value ? `${e.target.value}px` : '' })}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


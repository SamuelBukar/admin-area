import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { MdArrowBack, MdSave, MdSend } from 'react-icons/md';
import { usePageDetail } from '@/hooks/useQueries';
import { useSubmitApplication } from '@/hooks/useQueries';
import { useAuth } from '@/contexts/AuthContext';
import { FormElement, InputContent, SelectContent as SelectContentType, RadioContent, CheckboxContent, GridContent, ContainerContent, SpaceContent, ImageContent, ButtonContent } from '@/types/builder';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function ApplicationForm() {
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: page, isLoading } = usePageDetail(pageId || '');
  const submitApplication = useSubmitApplication();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Recursively initialize form data for all elements including nested ones
  const initializeFormData = (elements: FormElement[]): Record<string, any> => {
    const initialData: Record<string, any> = {};
    
    const processElement = (element: FormElement) => {
      if (element.type === 'INPUT' || element.type === 'TEXTAREA' || element.type === 'DATE') {
        initialData[element.id] = '';
      } else if (element.type === 'CHECKBOX') {
        initialData[element.id] = false;
      } else if (element.type === 'SELECT' || element.type === 'RADIO') {
        initialData[element.id] = '';
      } else if (element.type === 'CONTAINER') {
        const containerContent = element.content as ContainerContent;
        if (containerContent.children) {
          containerContent.children.forEach(processElement);
        }
      } else if (element.type === 'GRID') {
        const gridContent = element.content as GridContent;
        if (gridContent.children) {
          gridContent.children.forEach(column => {
            column.forEach(processElement);
          });
        }
      }
    };
    
    elements.forEach(processElement);
    return initialData;
  };

  useEffect(() => {
    if (page?.elements) {
      const initialData = initializeFormData(page.elements);
      setFormData(initialData);
    }
  }, [page]);


  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!page?.elements) return false;

    // Use a helper function to validate recursively
    const validateRecursive = (elements: FormElement[]) => {
      elements.forEach(element => {
        if (element.type === 'INPUT' || element.type === 'TEXTAREA' || element.type === 'DATE') {
          const content = element.content as InputContent;
          if (content.required && !formData[element.id]) {
            newErrors[element.id] = `${content.label} is required`;
          }
        } else if (element.type === 'SELECT') {
          const content = element.content as SelectContentType;
          if (content.required && !formData[element.id]) {
            newErrors[element.id] = `${content.label} is required`;
          }
        } else if (element.type === 'RADIO') {
          const content = element.content as RadioContent;
          if (content.required && !formData[element.id]) {
            newErrors[element.id] = `${content.label} is required`;
          }
        } else if (element.type === 'CONTAINER') {
          const containerContent = element.content as ContainerContent;
          if (containerContent.children) {
            validateRecursive(containerContent.children);
          }
        } else if (element.type === 'GRID') {
          const gridContent = element.content as GridContent;
          if (gridContent.children) {
            gridContent.children.forEach(column => {
              validateRecursive(column);
            });
          }
        }
      });
    };

    validateRecursive(page.elements);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (status: 'draft' | 'submitted' = 'submitted') => {
    if (status === 'submitted' && !validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!pageId || !user?.id) {
      toast.error('Missing required information');
      return;
    }

    try {
      await submitApplication.mutateAsync({
        pageId,
        userId: user.id,
        formData,
        status,
      });
      // Show success message and allow user to submit again or view applications
      if (status === 'submitted') {
        toast.success('Application submitted successfully! You can submit another application if needed.');
      } else {
        toast.success('Application saved as draft');
      }
      // Reset form data for new application
      if (page?.elements) {
        const initialData = initializeFormData(page.elements);
        setFormData(initialData);
        setErrors({});
      }
      // Navigate to my applications after a short delay
      setTimeout(() => {
        navigate('/dashboard/my-applications');
      }, 1500);
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  const renderElement = (element: FormElement): React.ReactNode => {
    const elementStyle = element.styles || {};

    switch (element.type) {
      case 'TITLE':
        return (
          <h1 className="text-3xl font-bold text-foreground mb-4" style={elementStyle}>
            {(element.content as string) || 'Title'}
          </h1>
        );

      case 'SUBTITLE':
        return (
          <h2 className="text-2xl font-semibold text-foreground mb-3" style={elementStyle}>
            {(element.content as string) || 'Subtitle'}
          </h2>
        );

      case 'PARAGRAPH':
        return (
          <p className="text-foreground mb-4" style={elementStyle}>
            {(element.content as string) || 'Paragraph text'}
          </p>
        );

      case 'DIVIDER':
        return <hr className="my-4" style={elementStyle} />;

      case 'INPUT':
      case 'DATE': {
        const inputContent = element.content as InputContent;
        const value = formData[element.id] || '';
        return (
          <div className="space-y-2 mb-4" style={elementStyle}>
            <Label className="text-sm font-medium text-foreground">
              {inputContent.label}
              {inputContent.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              type={element.type === 'DATE' ? 'date' : 'text'}
              placeholder={inputContent.placeholder}
              value={value}
              onChange={(e) => setFormData({ ...formData, [element.id]: e.target.value })}
              className={errors[element.id] ? 'border-destructive' : ''}
            />
            {errors[element.id] && (
              <p className="text-sm text-destructive">{errors[element.id]}</p>
            )}
          </div>
        );
      }

      case 'TEXTAREA': {
        const textareaContent = element.content as InputContent;
        const value = formData[element.id] || '';
        return (
          <div className="space-y-2 mb-4" style={elementStyle}>
            <Label className="text-sm font-medium text-foreground">
              {textareaContent.label}
              {textareaContent.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Textarea
              placeholder={textareaContent.placeholder}
              value={value}
              onChange={(e) => setFormData({ ...formData, [element.id]: e.target.value })}
              className={errors[element.id] ? 'border-destructive' : ''}
              rows={4}
            />
            {errors[element.id] && (
              <p className="text-sm text-destructive">{errors[element.id]}</p>
            )}
          </div>
        );
      }

      case 'SELECT': {
        const selectContent = element.content as SelectContentType;
        const value = formData[element.id] || '';
        return (
          <div className="space-y-2 mb-4" style={elementStyle}>
            <Label className="text-sm font-medium text-foreground">
              {selectContent.label}
              {selectContent.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Select
              value={value || undefined}
              onValueChange={(val) => setFormData({ ...formData, [element.id]: val })}
            >
              <SelectTrigger className={errors[element.id] ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {selectContent.options?.map((option, index) => (
                  <SelectItem key={index} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors[element.id] && (
              <p className="text-sm text-destructive">{errors[element.id]}</p>
            )}
          </div>
        );
      }

      case 'RADIO': {
        const radioContent = element.content as RadioContent;
        const value = formData[element.id] || '';
        return (
          <div className="space-y-2 mb-4" style={elementStyle}>
            <Label className="text-sm font-medium text-foreground">
              {radioContent.label}
              {radioContent.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <RadioGroup
              value={value}
              onValueChange={(val) => setFormData({ ...formData, [element.id]: val })}
            >
              {radioContent.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${element.id}-${index}`} />
                  <Label htmlFor={`${element.id}-${index}`} className="font-normal cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {errors[element.id] && (
              <p className="text-sm text-destructive">{errors[element.id]}</p>
            )}
          </div>
        );
      }

      case 'CHECKBOX': {
        const checkboxContent = element.content as CheckboxContent;
        const value = formData[element.id] || false;
        return (
          <div className="flex items-center space-x-3 mb-4" style={elementStyle}>
            <Checkbox
              id={element.id}
              checked={value}
              onCheckedChange={(checked) => setFormData({ ...formData, [element.id]: checked })}
            />
            <Label htmlFor={element.id} className="text-sm text-foreground cursor-pointer">
              {checkboxContent.label}
            </Label>
          </div>
        );
      }

      case 'CONTAINER': {
        const containerContent = element.content as ContainerContent;
        const elementStyle = element.styles || {};
        return (
          <div 
            className="border-2 border-dashed rounded-lg p-4 mb-4 bg-muted/20" 
            style={elementStyle}
          >
            {containerContent.title && (
              <h3 className="text-lg font-semibold mb-3">{containerContent.title}</h3>
            )}
            <div className="space-y-4">
              {containerContent.children?.map((child) => (
                <div key={child.id}>
                  {renderElement(child)}
                </div>
              ))}
            </div>
          </div>
        );
      }

      case 'GRID': {
        const gridContent = element.content as GridContent;
        const elementStyle = element.styles || {};
        const gridColumns = gridContent.columns || 2;
        return (
          <div 
            className={`grid gap-4 mb-4`}
            style={{
              ...elementStyle,
              gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
            }}
          >
            {gridContent.children?.map((column, colIndex) => (
              <div key={colIndex} className="space-y-4">
                {column.map((child) => (
                  <div key={child.id}>
                    {renderElement(child)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        );
      }

      case 'SPACE': {
        const spaceContent = element.content as SpaceContent;
        return (
          <div style={{ height: `${spaceContent.height || 40}px` }} />
        );
      }

      case 'IMAGE': {
        const imageContent = element.content as ImageContent;
        if (!imageContent.url) return null;
        return (
          <div className="mb-4" style={{ textAlign: imageContent.alignment || 'center', ...elementStyle }}>
            <img
              src={imageContent.url}
              alt={imageContent.alt || 'Form image'}
              style={{
                width: imageContent.width || '100%',
                height: imageContent.height || 'auto',
                maxWidth: '100%',
              }}
              className="rounded-lg"
            />
          </div>
        );
      }

      case 'BUTTON': {
        const buttonContent = element.content as ButtonContent;
        const handleButtonClick = async (e: React.MouseEvent) => {
          e.preventDefault();
          if (buttonContent.actionType === 'link' && buttonContent.link) {
            if (buttonContent.openInNewTab) {
              window.open(buttonContent.link, '_blank', 'noopener,noreferrer');
            } else {
              window.location.href = buttonContent.link;
            }
          } else if (buttonContent.actionType === 'api' && buttonContent.apiEndpoint) {
            toast.info('API action triggered', {
              description: `Calling ${buttonContent.apiMethod || 'GET'} ${buttonContent.apiEndpoint}`,
            });
            // In a real app, you would make the API call here
          }
        };
        return (
          <div className="mb-4" style={elementStyle}>
            <Button
              type="button"
              onClick={handleButtonClick}
              variant="default"
            >
              {buttonContent.label}
            </Button>
          </div>
        );
      }

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="p-6 lg:p-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Page not found</p>
            <Button onClick={() => navigate('/dashboard/applications')} className="mt-4">
              <MdArrowBack className="w-4 h-4 mr-2" />
              Back to Applications
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{page.title} | Application Form</title>
        <meta name="description" content={`Submit application: ${page.title}`} />
      </Helmet>

      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard/applications')}
              className="mb-4"
            >
              <MdArrowBack className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-foreground">{page.title}</h1>
            <p className="text-muted-foreground mt-2">
              {page.publishedAt && `Published on ${format(new Date(page.publishedAt), 'MMM dd, yyyy')}`}
            </p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Application Form</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={(e) => {
              e.preventDefault();
              handleSubmit('submitted');
            }}>
              {page.elements?.map((element) => (
                <div key={element.id}>
                  {renderElement(element)}
                </div>
              ))}

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSubmit('draft')}
                  disabled={submitApplication.isPending}
                >
                  <MdSave className="w-4 h-4 mr-2" />
                  Save as Draft
                </Button>
                <Button
                  type="button"
                  onClick={() => handleSubmit('submitted')}
                  disabled={submitApplication.isPending}
                >
                  <MdSend className="w-4 h-4 mr-2" />
                  {submitApplication.isPending ? 'Submitting...' : 'Submit Application'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}


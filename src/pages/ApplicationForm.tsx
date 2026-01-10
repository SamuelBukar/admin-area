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
import { FormElement, InputContent, SelectContent as SelectContentType, RadioContent, CheckboxContent } from '@/types/builder';
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

  useEffect(() => {
    if (page?.elements) {
      // Initialize form data with empty values
      const initialData: Record<string, any> = {};
      page.elements.forEach((element) => {
        if (element.type === 'INPUT' || element.type === 'TEXTAREA' || element.type === 'DATE') {
          initialData[element.id] = '';
        } else if (element.type === 'CHECKBOX') {
          initialData[element.id] = false;
        } else if (element.type === 'SELECT' || element.type === 'RADIO') {
          initialData[element.id] = '';
        }
      });
      setFormData(initialData);
    }
  }, [page]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!page?.elements) return false;

    page.elements.forEach((element) => {
      if (element.type === 'INPUT' || element.type === 'TEXTAREA' || element.type === 'DATE') {
        const content = element.content as InputContent;
        if (content.required && !formData[element.id]) {
          newErrors[element.id] = `${content.label} is required`;
        }
      }
    });

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
      navigate('/dashboard/my-applications');
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
              value={value}
              onValueChange={(val) => setFormData({ ...formData, [element.id]: val })}
            >
              <SelectTrigger className={errors[element.id] ? 'border-destructive' : ''}>
                <SelectValue placeholder={selectContent.placeholder || 'Select an option'} />
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

      case 'CONTAINER':
      case 'GRID':
      case 'SPACE':
        // These container elements don't render directly in form mode
        return null;

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
            <form className="space-y-6">
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

